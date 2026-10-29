import type { ChannelId } from "@/components/blocks/channel-meta"

export type ViewId = "my" | "unreplied" | "progress" | "pending" | "escalated" | "out-sla" | "bookmark" | "closed" | "all"
export type TicketState = "replied" | "unreplied" | "pending" | "out-sla"
export type Sentiment = "positive" | "neutral" | "negative"

export type ThreadItem =
  | { kind: "day"; label: string }
  | { kind: "in"; body: string; time: string }
  | { kind: "out"; body: string; time: string; agent: string }
  | { kind: "system"; body: string; time: string }

export type Ticket = {
  id: number
  customer: string
  initials: string
  channel: ChannelId
  account: string
  preview: string
  time: string
  openedAt: string
  state: TicketState
  slaOverdue?: string
  replies: number
  views: ViewId[]
  assignee: string
  group: string
  lockedBy?: string
  age: string
  sentiment: Sentiment
  thread: ThreadItem[]
}

export const views: { id: ViewId; label: string }[] = [
  { id: "my", label: "My tickets" },
  { id: "unreplied", label: "Unreplied" },
  { id: "progress", label: "Progress" },
  { id: "pending", label: "Pending" },
  { id: "escalated", label: "Escalated" },
  { id: "out-sla", label: "Out SLA" },
  { id: "bookmark", label: "Bookmark" },
  { id: "closed", label: "Closed" },
  { id: "all", label: "All" },
]

const shortThread = (inbound: string, time: string): ThreadItem[] => [
  { kind: "day", label: "Today" },
  { kind: "system", body: "Ticket created", time },
  { kind: "in", body: inbound, time },
]

// Sample tickets: names, numbers and messages are made up for the demo.
export const tickets: Ticket[] = [
  {
    id: 380,
    customer: "Andi Wijaya",
    initials: "AW",
    channel: "chat",
    account: "Pingot Chat",
    preview: "Baik, saya tunggu kabar selanjutnya ya kak. Terima kasih.",
    time: "2m",
    openedAt: "24 Sep 2026, 17:04",
    state: "replied",
    replies: 3,
    views: ["my", "progress", "all"],
    assignee: "Pingot Testing",
    group: "Customer Care",
    age: "2h 14m",
    sentiment: "neutral",
    thread: [
      { kind: "day", label: "24 Sep 2026" },
      { kind: "system", body: "Ticket created from Webchat", time: "17:04" },
      { kind: "system", body: "Distributed to pingottestting", time: "17:04" },
      { kind: "in", body: "Halo kak, saya mau tanya status klaim garansi mobil saya. Sudah 2 minggu belum ada kabar.", time: "17:04" },
      { kind: "out", body: "Halo Kak Andi, terima kasih sudah menghubungi kami. Boleh dibantu nomor rangka kendaraannya?", time: "17:06", agent: "Pingot Testing" },
      { kind: "in", body: "MHKA1BA1JKK012345", time: "17:09" },
      { kind: "out", body: "Terima kasih Kak. Klaim Kakak sedang diverifikasi oleh dealer, estimasi 3 hari kerja. Kami kabari lagi ya.", time: "17:12", agent: "Pingot Testing" },
      { kind: "in", body: "Baik, saya tunggu kabar selanjutnya ya kak. Terima kasih.", time: "17:13" },
    ],
  },
  {
    id: 379,
    customer: "Siti Rahmawati",
    initials: "SR",
    channel: "instagram",
    account: "@sociomile.demo",
    preview: "Kak, promo servis gratis masih berlaku sampai kapan?",
    time: "6m",
    openedAt: "24 Sep 2026, 17:31",
    state: "unreplied",
    replies: 0,
    views: ["my", "unreplied", "progress", "all"],
    assignee: "Pingot Testing",
    group: "Customer Care",
    age: "6m",
    sentiment: "positive",
    thread: shortThread("Kak, promo servis gratis masih berlaku sampai kapan?", "17:31"),
  },
  {
    id: 378,
    customer: "Bambang Hidayat",
    initials: "BH",
    channel: "email",
    account: "cs@demo-motor.example",
    preview: "Mohon dikirimkan invoice servis berkala bulan Agustus ke email ini.",
    time: "21m",
    openedAt: "24 Sep 2026, 17:16",
    state: "pending",
    replies: 1,
    views: ["pending", "progress", "all"],
    assignee: "Dewi Lestari",
    group: "Billing",
    age: "21m",
    sentiment: "neutral",
    thread: shortThread("Mohon dikirimkan invoice servis berkala bulan Agustus ke email ini.", "17:16"),
  },
  {
    id: 377,
    customer: "Rina Kusuma",
    initials: "RK",
    channel: "facebook",
    account: "Demo Motor ID",
    preview: "Sudah 3x saya komplain soal AC mobil tapi belum ada solusi!",
    time: "38m",
    openedAt: "24 Sep 2026, 16:59",
    state: "out-sla",
    slaOverdue: "2h",
    replies: 2,
    views: ["progress", "escalated", "out-sla", "all"],
    assignee: "Rizky Pratama",
    group: "Dealer Support",
    lockedBy: "Rizky Pratama",
    age: "4h 02m",
    sentiment: "negative",
    thread: [
      { kind: "day", label: "24 Sep 2026" },
      { kind: "in", body: "Sudah 3x saya komplain soal AC mobil tapi belum ada solusi!", time: "12:57" },
      { kind: "out", body: "Mohon maaf atas ketidaknyamanannya Kak Rina. Kami eskalasi ke tim dealer sekarang.", time: "13:20", agent: "Rizky Pratama" },
      { kind: "system", body: "Escalated to Dealer Support", time: "13:21" },
      { kind: "system", body: "Locked by Rizky Pratama", time: "13:21" },
    ],
  },
  {
    id: 376,
    customer: "Yoga Saputra",
    initials: "YS",
    channel: "twitter",
    account: "@demomotor_id",
    preview: "Booking servis lewat aplikasi kok error terus ya min?",
    time: "52m",
    openedAt: "24 Sep 2026, 16:45",
    state: "replied",
    replies: 4,
    views: ["progress", "all"],
    assignee: "Intan Permata",
    group: "Digital",
    age: "52m",
    sentiment: "negative",
    thread: shortThread("Booking servis lewat aplikasi kok error terus ya min?", "16:45"),
  },
  {
    id: 375,
    customer: "Maya Anggraini",
    initials: "MA",
    channel: "google-business",
    account: "Demo Motor Kemang",
    preview: "Jam operasional bengkel hari Minggu buka sampai jam berapa?",
    time: "1h",
    openedAt: "24 Sep 2026, 16:20",
    state: "unreplied",
    replies: 0,
    views: ["unreplied", "progress", "all"],
    assignee: "Dewi Lestari",
    group: "Customer Care",
    age: "1h 17m",
    sentiment: "neutral",
    thread: shortThread("Jam operasional bengkel hari Minggu buka sampai jam berapa?", "16:20"),
  },
  {
    id: 374,
    customer: "Fajar Nugroho",
    initials: "FN",
    channel: "chat",
    account: "Pingot Chat",
    preview: "Terima kasih, mobil sudah bisa diambil hari ini.",
    time: "2h",
    openedAt: "24 Sep 2026, 15:02",
    state: "replied",
    replies: 5,
    views: ["my", "progress", "all"],
    assignee: "Pingot Testing",
    group: "Customer Care",
    age: "2h 35m",
    sentiment: "positive",
    thread: shortThread("Terima kasih, mobil sudah bisa diambil hari ini.", "15:02"),
  },
  {
    id: 372,
    customer: "Lina Marlina",
    initials: "LM",
    channel: "email",
    account: "cs@demo-motor.example",
    preview: "Lampiran STNK sudah saya kirim ulang, mohon dicek.",
    time: "3h",
    openedAt: "24 Sep 2026, 14:10",
    state: "pending",
    replies: 2,
    views: ["my", "pending", "all"],
    assignee: "Pingot Testing",
    group: "Billing",
    age: "3h 27m",
    sentiment: "neutral",
    thread: shortThread("Lampiran STNK sudah saya kirim ulang, mohon dicek.", "14:10"),
  },
  {
    id: 365,
    customer: "Hendra Gunawan",
    initials: "HG",
    channel: "facebook",
    account: "Demo Motor ID",
    preview: "Oke kak, masalah sudah selesai.",
    time: "1d",
    openedAt: "23 Sep 2026, 10:41",
    state: "replied",
    replies: 6,
    views: ["closed", "all"],
    assignee: "Sari Wulandari",
    group: "Customer Care",
    age: "1d 7h",
    sentiment: "positive",
    thread: shortThread("Oke kak, masalah sudah selesai.", "10:41"),
  },
]
