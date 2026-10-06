export function toISODateUTC(date: string) {
  return new Date(`${date}T00:00:00Z`).toISOString();
}

export function formatDateTimeBR(date: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(date));
}

export function formatChartDate(date: string, short = false) {
  const [year, month, day] = date.slice(0, 10).split("-");
  if (!year || !month || !day) {
    return date;
  }
  return short ? `${day}/${month}` : `${day}/${month}/${year}`;
}

export function formatChartMonth(date: string, short = false) {
  const [year, month] = date.split("-");
  if (!year || !month) {
    return date;
  }
  return short ? month : `${month}/${year}`;
}
