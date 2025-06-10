from collections import Counter, defaultdict
import torch
import torch.nn as nn
import torch.nn.init as init
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from sklearn.model_selection import train_test_split
from torch.utils.tensorboard import SummaryWriter
import datetime
import time 

class GloVeModel(nn.Module):
    def __init__(self, embedding_size, context_size, vocab_size, min_occurrance=20, x_max=100, alpha=3 / 4):
        super(GloVeModel, self).__init__()

        self.embedding_size = embedding_size
        if isinstance(context_size, tuple):
            self.left_context, self.right_context = context_size
        elif isinstance(context_size, int):
            self.left_context = self.right_context = context_size
        else:
            raise ValueError()
        self.vocab_size = vocab_size
        self.alpha = alpha
        self.min_occurrance = min_occurrance
        self.x_max = x_max

        self._focal_embeddings = nn.Embedding(vocab_size, embedding_size).type(torch.float64)
        self._context_embeddings = nn.Embedding(vocab_size, embedding_size).type(torch.float64)
        self._focal_biases = nn.Embedding(vocab_size, 1).type(torch.float64)
        self._context_biases = nn.Embedding(vocab_size, 1).type(torch.float64)
        self._glove_dataset = None

        for params in self.parameters():
            init.uniform_(params, a=-1, b=1)

    def fit(self, corpus):
        left_size, right_size = self.left_context, self.right_context
        vocab_size, min_occurrance = self.vocab_size, self.min_occurrance

        word_counts = Counter()
        cooccurence_counts = defaultdict(float)
        for region in corpus:
            word_counts.update(region)
            for left_context, word, right_context in _context_windows(region, left_size, right_size):
                for i, context_word in enumerate(left_context[::-1]):
                    cooccurence_counts[(word, context_word)] += 1 / (i + 1)
                for i, context_word in enumerate(right_context):
                    cooccurence_counts[(word, context_word)] += 1 / (i + 1)
        if len(cooccurence_counts) == 0:
            raise ValueError("No coccurrences in corpus, Did you try to reuse a generator?")

        tokens = [word for word, count in word_counts.most_common(int(vocab_size)) if count >= min_occurrance]
        coocurrence_matrix = [(words[0], words[1], count)
                              for words, count in cooccurence_counts.items()
                              if words[0] in tokens and words[1] in tokens]
        self._glove_dataset = GloVeDataSet(coocurrence_matrix)

    def train_glove(self, num_epoch, device, learning_rate=0.005, batch_size=512, validation_split=0.1, patience=10):
        if self._glove_dataset is None:
            raise NotFitToCorpusError("Please fit model with corpus before training")

        full_data = self._glove_dataset._coocurrence_matrix
        train_data, val_data = train_test_split(full_data, test_size=validation_split, random_state=42)

        train_dataset = GloVeDataSet(train_data)
        val_dataset = GloVeDataSet(val_data)

        train_loader = DataLoader(train_dataset, batch_size)
        val_loader = DataLoader(val_dataset, batch_size)

        optimizer = optim.Adam(self.parameters(), lr=learning_rate)

        best_val_loss = float('inf')
        epochs_without_improvement = 0

        history = {
            'loss': [],
            'val_loss': []
        }

        print("Start training...\n")
        for epoch in range(num_epoch):
            start_time = time.time()  # ✅ Start timp epocă
            self.train()
            running_loss = 0

            for batch in train_loader:
                optimizer.zero_grad()
                i_s, j_s, counts = [x.to(device) for x in batch]
                loss = self._loss(i_s, j_s, counts)
                loss.backward()
                optimizer.step()
                running_loss += loss.item()

            avg_train_loss = running_loss / len(train_loader)
            history['loss'].append(avg_train_loss)

            self.eval()
            val_loss = 0
            with torch.no_grad():
                for batch in val_loader:
                    i_s, j_s, counts = [x.to(device) for x in batch]
                    loss = self._loss(i_s, j_s, counts)
                    val_loss += loss.item()

            avg_val_loss = val_loss / len(val_loader)
            history['val_loss'].append(avg_val_loss)

            t_epoch = time.time() - start_time  # ✅ Durata epocii

            if epoch == 0:
                print("-" * 61)
                print(f"{'EPOCH':^7} | {'TRAIN LOSS':^14} | {'VAL LOSS':^14} | {'TIME (s)':^9}")
                print("-" * 61)

            print(f"{epoch+1:^7} | {avg_train_loss:^14.6f} | {avg_val_loss:^14.6f} | {t_epoch:^9.2f}")

            if avg_val_loss < best_val_loss:
                best_val_loss = avg_val_loss
                epochs_without_improvement = 0
            else:
                epochs_without_improvement += 1
                if epochs_without_improvement >= patience:
                    print(f"Early stopping triggered at epoch {epoch + 1}")
                    break

        print("Training finished.")
        return history

    def get_coocurrance_matrix(self):
        return self._glove_dataset._coocurrence_matrix

    def embedding_for_tensor(self, tokens):
        if not torch.is_tensor(tokens):
            raise ValueError("the tokens must be pytorch tensor object")

        return self._focal_embeddings(tokens) + self._context_embeddings(tokens)

    def _loss(self, focal_input, context_input, coocurrence_count):
        x_max, alpha = self.x_max, self.alpha

        focal_embed = self._focal_embeddings(focal_input)
        context_embed = self._context_embeddings(context_input)
        focal_bias = self._focal_biases(focal_input)
        context_bias = self._context_biases(context_input)

        weight_factor = torch.pow(coocurrence_count / x_max, alpha)
        weight_factor[weight_factor > 1] = 1

        embedding_products = torch.sum(focal_embed * context_embed, dim=1)
        log_cooccurrences = torch.log(coocurrence_count)

        distance_expr = (embedding_products + focal_bias + context_bias - log_cooccurrences) ** 2
        single_losses = weight_factor * distance_expr
        mean_loss = torch.mean(single_losses)
        return mean_loss


class GloVeDataSet(Dataset):
    def __init__(self, coocurrence_matrix):
        self._coocurrence_matrix = coocurrence_matrix

    def __getitem__(self, index):
        return self._coocurrence_matrix[index]

    def __len__(self):
        return len(self._coocurrence_matrix)


class NotTrainedError(Exception):
    pass


class NotFitToCorpusError(Exception):
    pass


def _context_windows(region, left_size, right_size):
    for i, word in enumerate(region):
        start_index = i - left_size
        end_index = i + right_size
        left_context = _window(region, start_index, i - 1)
        right_context = _window(region, i + 1, end_index)
        yield (left_context, word, right_context)


def _window(region, start_index, end_index):
    last_index = len(region) + 1
    selected_tokens = region[max(start_index, 0):min(end_index, last_index) + 1]
    return selected_tokens
