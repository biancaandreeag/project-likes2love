from collections import defaultdict
import spacy

class SpacyTokenizer:
    def __init__(self, lang: str, disable=None):
        if disable is None:
            disable = ['tagger']
        self._nlp = spacy.load(lang, disable=disable)
        self._nlp.max_length = 50000000

    def tokenize(self, text: str) -> list:
        max_len = self._nlp.max_length
        lines = text.splitlines()
    
        doc = []
        for line in lines:
            line = line.strip().lower()
            if len(line) > max_len:
                for i in range(0, len(line), max_len):
                    chunk = line[i:i + max_len]
                    spacy_doc = self._nlp(chunk)
                    tokens = [token.lemma_ for token in spacy_doc if token.is_alpha and not token.is_stop]
                    if tokens:
                        doc.append(tokens)
            else:
                spacy_doc = self._nlp(line)
                tokens = [token.lemma_ for token in spacy_doc if token.is_alpha and not token.is_stop]
                if tokens:
                    doc.append(tokens)
        return doc

class Dictionary:
    def __init__(self, doc=None):

        self.vocab_size = 0
        self.word2idx = defaultdict(int)

        self.update(doc)

    def update(self, doc: list):
        if doc is None:
            return

        vocab_size, word2idx = self.vocab_size, self.word2idx

        tokens = set()
        for line in doc:
            tokens.update(line)

        for token in tokens:
            if token not in word2idx:
                word2idx[token] = vocab_size
                vocab_size += 1

        self.vocab_size = vocab_size

    def corpus(self, doc: list) -> list:
        word2idx = self.word2idx
        corpus = [[word2idx[word] for word in line if word in word2idx]
                  for line in doc]
        return corpus