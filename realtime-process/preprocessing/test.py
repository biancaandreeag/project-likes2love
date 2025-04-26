import contractions

def expand_contractions(text):
    return contractions.fix(text)

# Exemplu de utilizare:
text = "I don't know if I cant do this."
expanded_text = expand_contractions(text)
print(expanded_text)
