import torch
import torch.nn as nn
from transformers import RobertaModel, RobertaTokenizer
from transformers import logging
from collections import Counter, defaultdict
from shared_utils.logger_config  import log
logging.set_verbosity_error()

class Roberta_Classifier(nn.Module):
    def __init__(self,
                 freeze_bert=False):
        super(Roberta_Classifier, self).__init__()

        n_input = 768
        n_hidden = 50
        n_output = 5

        self.roberta = RobertaModel.from_pretrained("roberta-base")

        self.classifier = nn.Sequential(
            nn.Linear(n_input, n_hidden),
            nn.Dropout(0.2),
            nn.LeakyReLU(),
            nn.Linear(n_hidden, n_output)
        )

        if freeze_bert:
            for param in self.roberta.parameters():
                param.requires_grad = False

    def forward(self, input_ids, attention_mask):
        outputs = self.roberta(input_ids=input_ids,
                              attention_mask=attention_mask)
        last_hidden_state_cls = outputs[0][:, 0, :]
        logits = self.classifier(last_hidden_state_cls)
        return logits


class CyberbullyingClassifier:
    def __init__(self, model_path="Models/roberta_cyberbullying_model.pth", device=None):
        self.device = device or torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.class_labels = [
            "gender",
            "religion",
            "other_cyberbullying",
            "age",
            "ethnicity"
        ]

        self.model = Roberta_Classifier(freeze_bert=False).to(self.device)
        state = torch.load(model_path, map_location=self.device)
        self.model.load_state_dict(state, strict=False)
        self.model.eval()

        self.tokenizer = RobertaTokenizer.from_pretrained("roberta-base")

    def classify_text(self, text, max_length=256):
        self.model.eval()
        encoded = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=max_length,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        input_ids = encoded['input_ids'].to(self.device)
        attention_mask = encoded['attention_mask'].to(self.device)

        with torch.no_grad():
            logits = self.model(input_ids, attention_mask)
            probs = torch.softmax(logits, dim=-1).cpu().tolist()[0]
            pred_idx = int(torch.argmax(logits, dim=-1).cpu().item())
            pred_label = self.class_labels[pred_idx]

        return pred_label, probs

    def classify_comments(self, comments):
        log.info(f"[ AI MODULE - CYBERBULLYING ANALYSIS ][ Starting analysis... ]")
        results = []
        for comment in comments:
            label, probs = self.classify_text(comment)
            results.append({
                'predicted_label': label,
                'probabilities': dict(zip(self.class_labels, probs))
            })
        return results

    def summarize_results(self, results):
        label_counts = Counter()
        prob_sums = defaultdict(float)

        for result in results:
            label_counts[result['predicted_label']] += 1
            for label, prob in result['probabilities'].items():
                prob_sums[label] += prob

        num_comments = len(results)
        avg_probs = {label: prob_sums[label] / num_comments for label in self.class_labels}

        return {
            "label_counts": dict(label_counts),
            "average_probabilities": avg_probs
        }

