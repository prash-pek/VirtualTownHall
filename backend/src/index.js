const app = require('./app');
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`TownHall AI backend running on http://localhost:${PORT}`);
});
