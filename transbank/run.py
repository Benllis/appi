from app import create_app
import sys
from os.path import dirname, abspath
sys.path.insert(0, dirname(dirname(abspath(__file__))))

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
