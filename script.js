// Handles data storage using localStorage
// Each habit has: id, name, color, and a log of completed dates

const STORAGE_KEY = "habits_data";

function loadHabits() {
  var raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.log("Error reading saved data", e);
    return [];
  }
}

function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

// returns the date in YYYY-MM-DD format, optionally going back N days
function getDateKey(daysAgo) {
  var d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

var habits = loadHabits();

var habitInput = document.getElementById("habitInput");
var colorPick = document.getElementById("colorPick");
var addBtn = document.getElementById("addBtn");
var habitList = document.getElementById("habitList");
var emptyState = document.getElementById("emptyState");
var statTotal = document.getElementById("statTotal");
var statToday = document.getElementById("statToday");
var statBestStreak = document.getElementById("statBestStreak");
var chartCanvas = document.getElementById("chart");

// counts how many consecutive days (starting from today) have been completed
function calculateStreak(habit) {
  var streak = 0;
  var i = 0;
  while (habit.log[getDateKey(i)]) {
    streak = streak + 1;
    i = i + 1;
  }
  return streak;
}

function bestStreak() {
  var best = 0;
  for (var i = 0; i < habits.length; i++) {
    var s = calculateStreak(habits[i]);
    if (s > best) {
      best = s;
    }
  }
  return best;
}

function render() {
  habitList.innerHTML = "";

  if (habits.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  for (var i = 0; i < habits.length; i++) {
    var habit = habits[i];
    var doneToday = !!habit.log[getDateKey(0)];
    var streak = calculateStreak(habit);

    var card = document.createElement("div");
    card.className = "habit-card";

    var check = document.createElement("button");
    check.className = "habit-check" + (doneToday ? " done" : "");
    check.style.setProperty("--dot-color", habit.color);
    check.textContent = doneToday ? "X" : "";
    check.addEventListener("click", (function(id) {
      return function() {
        markToday(id);
      };
    })(habit.id));

    var info = document.createElement("div");
    info.className = "habit-info";

    var name = document.createElement("div");
    name.className = "habit-name";
    name.textContent = habit.name;

    var meta = document.createElement("div");
    meta.className = "habit-meta";
    meta.textContent = doneToday ? "Done today" : "Not done today";

    info.appendChild(name);
    info.appendChild(meta);

    var streakBox = document.createElement("div");
    streakBox.className = "habit-streak";
    streakBox.textContent = "Streak: " + streak;

    var delBtn = document.createElement("button");
    delBtn.className = "habit-delete";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", (function(id) {
      return function() {
        deleteHabit(id);
      };
    })(habit.id));

    card.appendChild(check);
    card.appendChild(info);
    card.appendChild(streakBox);
    card.appendChild(delBtn);

    habitList.appendChild(card);
  }

  updateStats();
  drawChart();
}

function updateStats() {
  statTotal.textContent = habits.length;

  if (habits.length === 0) {
    statToday.textContent = "0%";
  } else {
    var done = 0;
    for (var i = 0; i < habits.length; i++) {
      if (habits[i].log[getDateKey(0)]) {
        done = done + 1;
      }
    }
    statToday.textContent = Math.round((done / habits.length) * 100) + "%";
  }

  statBestStreak.textContent = bestStreak();
}

// draws a simple bar chart with data from the last 14 days
function drawChart() {
  var ctx = chartCanvas.getContext("2d");
  var width = chartCanvas.width;
  var height = chartCanvas.height;
  ctx.clearRect(0, 0, width, height);

  var days = 14;
  var margin = 15;
  var barSpace = (width - margin * 2) / days;

  ctx.strokeStyle = "#999";
  ctx.beginPath();
  ctx.moveTo(margin, height - margin);
  ctx.lineTo(width - margin, height - margin);
  ctx.stroke();

  for (var i = 0; i < days; i++) {
    var dayIndex = days - 1 - i;
    var key = getDateKey(dayIndex);
    var rate = 0;

    if (habits.length > 0) {
      var count = 0;
      for (var j = 0; j < habits.length; j++) {
        if (habits[j].log[key]) {
          count = count + 1;
        }
      }
      rate = count / habits.length;
    }

    var barHeight = rate * (height - margin * 2);
    var x = margin + i * barSpace;
    var y = height - margin - barHeight;

    ctx.fillStyle = rate > 0 ? "#1565c0" : "#ddd";
    ctx.fillRect(x, y, barSpace - 3, Math.max(barHeight, 1));
  }
}

function addHabit() {
  var name = habitInput.value.trim();
  if (name === "") {
    return;
  }

  var newHabit = {
    id: Date.now().toString(),
    name: name,
    color: colorPick.value,
    log: {}
  };

  habits.push(newHabit);
  saveHabits(habits);
  habitInput.value = "";
  render();
}

function markToday(id) {
  var habit = null;
  for (var i = 0; i < habits.length; i++) {
    if (habits[i].id === id) {
      habit = habits[i];
    }
  }
  if (!habit) {
    return;
  }

  var key = getDateKey(0);
  if (habit.log[key]) {
    delete habit.log[key];
  } else {
    habit.log[key] = true;
  }

  saveHabits(habits);
  render();
}

function deleteHabit(id) {
  habits = habits.filter(function(h) {
    return h.id !== id;
  });
  saveHabits(habits);
  render();
}

addBtn.addEventListener("click", addHabit);
habitInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    addHabit();
  }
});

render();
