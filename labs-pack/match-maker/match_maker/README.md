# 🧮 Math Memory - Laboratory Work

Interactive web game for developing school students' memory with mathematical examples.

## 📋 Description

This web application is a "Memory" game with a mathematical focus. Students need to find pairs of cards: a mathematical example and its correct answer. The game helps develop memory, attention, and mathematical skills.

## 🎮 Functionality

### Main features:
- **Two game modes:**
  - **Step counting mode** - counts the number of attempts to find all pairs
  - **Time counting mode** - measures the time spent on the game

- **Three difficulty levels:**
  - **Easy** - 6 pairs of cards (4×3 grid)
  - **Medium** - 8 pairs of cards (4×4 grid) 
  - **Hard** - 12 pairs of cards (6×4 grid)

- **Mathematical operations:**
  - Addition (+)
  - Subtraction (-)
  - Multiplication (×)

### Game process:
1. Student selects game mode and difficulty
2. Clicks "Start Game"
3. Cards appear face down
4. Student clicks on a card to see an example or number
5. Then selects a second card
6. If the example and answer match - pair is found
7. Game continues until all pairs are found

## 🚀 Launch

1. Open the `index.html` file in any modern browser
2. Or run a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (if installed)
   npx http-server
   ```

## 📁 Project Structure

```
match_maker/
├── index.html      # Main HTML page
├── styles.css      # CSS styles and design
├── script.js       # JavaScript game logic
└── README.md       # Documentation
```

## 🎯 Educational Goals

- **Memory development** - remembering card positions
- **Mathematical skills** - solving examples
- **Logical thinking** - finding matches
- **Attention** - focusing on the task
- **Reaction speed** - quickly finding pairs

## 🎨 Design Features

- Modern and attractive interface
- Responsive design for different devices
- Smooth animations and transitions
- Color indication of card states
- Intuitive controls

## 🔧 Technical Details

- **HTML5** - semantic markup
- **CSS3** - modern styles and animations
- **JavaScript ES6+** - object-oriented approach
- **Responsive design** - works on all devices
- **No dependencies** - doesn't require external libraries

## 📊 Game Statistics

The game tracks:
- Number of steps taken
- Time spent
- Number of pairs found
- Completion progress

## 🎓 Educational Use

The game is suitable for:
- Primary school (grades 1-4)
- Extracurricular activities
- Homework assignments
- Individual work
- Group competitions

## 🔄 Possible Improvements

- Adding sound effects
- Achievement system
- Leaderboard
- Additional mathematical operations
- Various themes
- Results export 