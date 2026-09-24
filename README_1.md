# Habit Tracker

A small web app to keep track of daily habits.
You can add habits, mark them as done each day, and see the last 14 days
of progress in a chart.

Demo: (add link here after deploying)

## Features

- Add and delete habits
- Choose a color for each habit
- Automatic streak calculation (consecutive days completed)
- Bar chart showing the completion rate for the last 14 days
- Data is saved in the browser using localStorage (persists after closing the page)

## Project structure

- `index.html` - page structure
- `style.css` - styling
- `script.js` - app logic

## Running locally

Just open `index.html` in a browser, or start a local server:

```
python3 -m http.server 8000
```

and visit `http://localhost:8000`


## Notes

Data is stored client-side with localStorage: there is no external database,
but data still persists between sessions, which is the "real feature"
required by the assignment.
