// Tanggal hari ini di zona waktu WIB, format YYYY-MM-DD
export function todayWIB() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(new Date());
}