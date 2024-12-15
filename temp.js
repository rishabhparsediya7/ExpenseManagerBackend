const weekDates = [
  { date: "21-10-2024", day: "M" },
  { date: "22-10-2024", day: "T" },
  { date: "23-10-2024", day: "W" },
  { date: "24-10-2024", day: "T" },
  { date: "25-10-2024", day: "F" },
  { date: "26-10-2024", day: "S" },
  { date: "27-10-2024", day: "S" },
];

const data = [
  {
    amount: "60",
    date: "2024-10-24T17:01:54.225Z",
    expenseType: "Food",
    name: "Momos",
  },
  {
    amount: "80",
    date: "2024-10-24T17:01:54.225Z",
    expenseType: "Food",
    name: "Momos again",
  },
];

const result = [];
weekDates.map((weekDate) => {
  const sum = data.reduce((acc, s) => {
    console.log("🚀 ~ sum ~ s:", s);
    const date = s.date.split("T")[0].split("-").reverse().join("-");
    if (date == weekDate.date) {
      return acc + Number(s.amount);
    }
    return acc;
  }, 0);
  result.push({
    date: weekDate.date,
    amount: sum,
  });
});

console.log("🚀 ~ result:", result);
