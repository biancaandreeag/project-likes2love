from transformers import AutoModelForSequenceClassification
from transformers import AutoTokenizer
import numpy as np
from scipy.special import softmax
import csv
import urllib.request
from shared_utils.logger_config  import log

class GeneralSentimentAnalyzer:
    def __init__(self, task='sentiment'):
        self.task = task
        self.model_name = f"cardiffnlp/twitter-roberta-base-{task}"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)

        mapping_link = f"https://raw.githubusercontent.com/cardiffnlp/tweeteval/main/datasets/{task}/mapping.txt"
        with urllib.request.urlopen(mapping_link) as f:
            html = f.read().decode('utf-8').split("\n")
            csvreader = csv.reader(html, delimiter='\t')
            self.labels = [row[1] for row in csvreader if len(row) > 1]

        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)

    def analyze(self, text):
        encoded_input = self.tokenizer(
            text,
            return_tensors='pt',
            padding=True,
            truncation=True,
            max_length=256
        )
        output = self.model(**encoded_input)
        scores = output[0][0].detach().numpy()
        scores = softmax(scores)

        ranking = np.argsort(scores)[::-1]
        results = []
        for i in ranking:
            results.append((self.labels[i], float(np.round(scores[i], 4))))
        return results

    def analyze_batch(self, texts):
        log.info(f"[ AI MODULE - GENERAL ANALYSIS ][ Starting analysis... ]")
        counts = {label: 0 for label in self.labels}
        score_sums = {label: 0.0 for label in self.labels}
        total_texts = len(texts)

        for text in texts:
            results = self.analyze(text)

            top_label, top_score = max(results, key=lambda x: x[1])
            counts[top_label] += 1


            for label, score in results:
                score_sums[label] += score

        percent_counts = {label: round((counts[label] / total_texts) * 100, 1) for label in counts}

        avg_scores = {label: round((score_sums[label] / total_texts) * 100, 1) for label in self.labels}

        general_results= {
            "percent_counts": percent_counts,
            "average_scores": avg_scores
        }

        return general_results
