from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.void_elements = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', 'circle', 'path'}
        
    def handle_starttag(self, tag, attrs):
        if tag not in self.void_elements:
            attrs_str = ' '.join([f'{k}="{v}"' for k,v in attrs])
            self.stack.append((tag, self.getpos()[0], attrs_str))
            
    def handle_endtag(self, tag):
        if tag not in self.void_elements:
            if not self.stack:
                print(f'Error: Unmatched closing tag </{tag}> at line {self.getpos()[0]}')
                return
            last_tag, line, attrs = self.stack.pop()
            if last_tag != tag:
                print(f'Error: Mismatched tag: expected </{last_tag}> (opened at {line}: <{last_tag} {attrs}>), got </{tag}> at line {self.getpos()[0]}')
                found = False
                for i in range(len(self.stack)-1, -1, -1):
                    if self.stack[i][0] == tag:
                        found = True
                        break
                if found:
                    while self.stack:
                        popped_tag, popped_line, popped_attrs = self.stack.pop()
                        if popped_tag == tag:
                            break

parser = MyHTMLParser()
with open('index.html', 'r', encoding='utf-8') as f:
    parser.feed(f.read())
    
if parser.stack:
    for tag, line, attrs in parser.stack:
        if tag not in ['img', 'br', 'hr', 'circle', 'path']:
            print(f'Unclosed tag: <{tag}> at line {line}')
