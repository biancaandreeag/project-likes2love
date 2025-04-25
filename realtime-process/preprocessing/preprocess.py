from preprocessing.emoticons import EMOTICONS, UNICODE_EMO
from shared_utils.logger_config import log
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
import pandas as pd
import unicodedata
import warnings
import nltk
import re

warnings.simplefilter("ignore", category=SyntaxWarning)

class PreprocessData:    
    def __init__(self):
        self.post_id = None
        self.post_model = None
        self.lemmatizer = None
        self.stop_words = None
        

    def configuration(self, post_id, model):
        self.post_id = post_id
        self.post_model = model
        if self.post_model == 'classifier':
            nltk.download('stopwords')
            nltk.download('wordnet')
            nltk.download('punkt')
            log.info(nltk.data.path)
            self.stop_words = set(stopwords.words('english'))
            self.lemmatizer = WordNetLemmatizer()
        
    def remove_urls(self, text):
        return re.sub(r'http[s]?://\S+', '', text)

    def remove_user_mentions(self, text):
        return re.sub(r'@[A-Za-z0-9_.]+', '', text)

    def remove_hashtags(self, text):
        return re.sub(r'#+(\S+)', r'\1', text)

    def remove_spaces(self, text):
        clean_text = " ".join(text.split())
        return clean_text
    
    def remove_digits(self, text):
        return re.sub(r'\d+', '', text)

    def remove_accented_chars(self, text):
        return unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8', 'ignore')

    def remove_repetition(self, text):
        sequencePattern = r"(.)\1\1+"
        seqReplacePattern = r"\1\1"
        return re.sub(sequencePattern, seqReplacePattern, text)
    
    def convert_emoticons(self, text):
        for emot in EMOTICONS:
            text = re.sub(u'(' + emot + ')', "  ".join(EMOTICONS[emot].replace(",", "").split()), text)
        return text

    def convert_emojis(self, text):
        for emot in UNICODE_EMO:
            text = re.sub(r'(' + emot + ')', "  ".join(UNICODE_EMO[emot].replace(",", "").replace(":", "").split()), text)
        return text
    
    def remove_unknown_emojis(self, text):
        emoji_pattern = re.compile("[" 
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
            u"\U00002702-\U000027B0"  # miscellaneous symbols
            u"\U0001F900-\U0001F9FF"  # supplemental symbols
            u"\U0001F200-\U0001F251"  # enclosed characters
            u"\U0001F004-\U0001F0CF"  # playing cards
            u"\U00002B50"  # star symbol
            "]+", flags=re.UNICODE)
        
        emojis_in_text = emoji_pattern.findall(text)
        
        for emoji_char in emojis_in_text:
            if emoji_char not in UNICODE_EMO:
                text = text.replace(emoji_char, '')  
        return text
    
    def remove_symbols_and_special_chars(self, text):
        text = re.sub(r'[^\x00-\x7F]+', '', text) 
        return text
    
    def remove_punctuation(self, text):
        return re.sub(r'[^\w\s]', '', text)

    def lemmatize_text(self, text):
        tokens = word_tokenize(text)
        lemmatized = [self.lemmatizer.lemmatize(token) for token in tokens]
        return " ".join(lemmatized)

    def remove_invalid_characters(self, text):
        return re.sub(r'[^a-zA-Z0-9\s\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]+',' ', text)

    def remove_stopwords(self, text):
        tokens = word_tokenize(text)
        filtered_text = [word for word in tokens if word.lower() not in self.stop_words]
        return " ".join(filtered_text)
    
    def preprocessing_classifiers(self, text):
        text = self.remove_urls(text)
        text = self.remove_user_mentions(text)
        text = self.remove_hashtags(text)
        text = self.remove_repetition(text)
        text = self.convert_emoticons(text)
        text = self.convert_emojis(text)
        text = self.remove_unknown_emojis(text)
        text = self.remove_accented_chars(text)
        text = self.remove_digits(text)
        text = self.remove_punctuation(text)
        text = self.remove_spaces(text)
        text = text.lower()
        text = self.lemmatize_text(text)
        text = self.remove_stopwords(text)
        return text
    
    def preprocess_text(self, comments):
        df_comments = pd.DataFrame(comments, columns=['text'])
        
        if self.post_model == "classifier":
            log.info(f"[ PREPROCESS - {self.post_id} ][ Start preprocessing for classifier model. ]")
            df_comments['preprocessed_text'] = df_comments['text'].apply(self.preprocessing_classifiers)
        
        preprocessed_comments = df_comments['preprocessed_text'].tolist()
        
        log.info(f"[ PREPROCESS - {self.post_id} ][ Preprocessing finished. ]")
        
        del df_comments
        return preprocessed_comments
