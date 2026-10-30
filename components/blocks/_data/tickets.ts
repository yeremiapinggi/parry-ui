import type { ChannelId } from "@/components/blocks/channel-meta"

export type ViewId = "my" | "unreplied" | "progress" | "pending" | "escalated" | "out-sla" | "bookmark" | "closed" | "all"
export type TicketState = "replied" | "unreplied" | "pending" | "out-sla"
export type TicketStatus = "open" | "pending" | "closed" | "spam" | "other"
export type Sentiment = "positive" | "neutral" | "negative"
export type Priority = "Low" | "Medium" | "High" | "Urgent"
export type Delivery = "sent" | "delivered" | "read"

// `at` is an ISO timestamp; the UI derives relative time, full time on hover and day dividers from it.
export type ThreadItem =
  | { kind: "in"; body: string; at: string }
  | { kind: "out"; body: string; at: string; agent: string; delivery: Delivery }
  | { kind: "system"; body: string; at: string }
  | { kind: "note"; body: string; at: string; agent: string }
  | { kind: "escalation"; body: string; at: string; agent: string; to: string }

export type Contact = {
  email?: string
  phone?: string
  identities: { channel: ChannelId; handle: string }[]
  tags: string[]
}

export type HistoryItem = { id: number; subject: string; status: TicketStatus; at: string }

export type Ticket = {
  id: number
  customer: string
  initials: string
  channel: ChannelId
  account: string
  preview: string
  time: string
  createdAt: string
  state: TicketState
  slaOverdue?: string
  replies: number
  views: ViewId[]
  status: TicketStatus
  priority: Priority
  category?: string
  assignee: string
  group: string
  lockedBy?: string
  sentiment: Sentiment
  contact: Contact
  history: HistoryItem[]
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

const at = (day: string, time: string) => `2026-09-${day}T${time}+07:00`

const shortThread = (inbound: string, when: string, channel: string): ThreadItem[] => [
  { kind: "system", body: `Ticket created from ${channel}`, at: when },
  { kind: "in", body: inbound, at: when },
]

// Sample tickets: names, numbers and messages are made up for the demo.
export const tickets: Ticket[] = [
  {
    id: 380,
    customer: "Yeremia Hendarta",
    initials: "YH",
    channel: "chat",
    account: "Sociomile Live Chat",
    preview: "Baik, saya tunggu kabar selanjutnya ya kak. Terima kasih.",
    time: "2m",
    createdAt: at("24", "17:04:40"),
    state: "replied",
    replies: 3,
    views: ["my", "progress", "all"],
    status: "open",
    priority: "Medium",
    category: "Warranty claim",
    assignee: "Pingot Testing",
    group: "Customer Care",
    sentiment: "neutral",
    contact: {
      email: "yeremia.hendarta@example.com",
      phone: "+62 812-0000-0380",
      identities: [
        { channel: "chat", handle: "Visitor A1B2 · Sociomile Live Chat" },
        { channel: "instagram", handle: "@yeremia.sample" },
      ],
      tags: ["Warranty", "Returning customer"],
    },
    history: [
      { id: 318, subject: "Jadwal servis berkala 10.000 km", status: "closed", at: at("02", "10:12:00") },
      { id: 251, subject: "Konfirmasi pembayaran booking", status: "closed", at: "2026-08-14T14:40:00+07:00" },
    ],
    thread: [
      { kind: "system", body: "Ticket created from Webchat", at: at("24", "17:04:40") },
      { kind: "system", body: "Distributed to pingottestting", at: at("24", "17:04:41") },
      { kind: "in", body: "Halo kak, saya mau tanya status klaim garansi mobil saya.", at: at("24", "17:04:46") },
      { kind: "in", body: "Sudah 2 minggu belum ada kabar.", at: at("24", "17:05:02") },
      {
        kind: "out",
        body: "Halo Kak Yeremia, terima kasih sudah menghubungi kami. Boleh dibantu nomor rangka kendaraannya?",
        at: at("24", "17:06:10"),
        agent: "pingottestting",
        delivery: "read",
      },
      { kind: "in", body: "MHKA1BA1JKK012345", at: at("24", "17:09:31") },
      { kind: "note", body: "Klaim tercatat di sistem dealer, menunggu verifikasi part dari pabrik.", at: at("24", "17:10:05"), agent: "pingottestting" },
      {
        kind: "out",
        body: "Terima kasih Kak. Klaim Kakak sedang diverifikasi oleh dealer, estimasi 3 hari kerja. Kami kabari lagi ya.",
        at: at("24", "17:12:20"),
        agent: "pingottestting",
        delivery: "delivered",
      },
      { kind: "in", body: "Baik, saya tunggu kabar selanjutnya ya kak. Terima kasih.", at: at("24", "17:13:02") },
    ],
  },
  {
    id: 379,
    customer: "Siti Rahmawati",
    initials: "SR",
    channel: "instagram",
    account: "@ivosights_id",
    preview: "Kak, promo servis gratis masih berlaku sampai kapan?",
    time: "6m",
    createdAt: at("24", "17:09:00"),
    state: "unreplied",
    replies: 0,
    views: ["my", "unreplied", "progress", "all"],
    status: "open",
    priority: "Low",
    assignee: "Pingot Testing",
    group: "Customer Care",
    sentiment: "positive",
    contact: { identities: [{ channel: "instagram", handle: "@siti.sample" }], tags: [] },
    history: [],
    thread: shortThread("Kak, promo servis gratis masih berlaku sampai kapan?", at("24", "17:09:00"), "Instagram DM"),
  },
  {
    id: 378,
    customer: "Bambang Hidayat",
    initials: "BH",
    channel: "email",
    account: "hello@ivosights.com",
    preview: "Mohon dikirimkan invoice servis berkala bulan Agustus ke email ini.",
    time: "21m",
    createdAt: at("24", "16:54:00"),
    state: "pending",
    replies: 1,
    views: ["pending", "progress", "all"],
    status: "pending",
    priority: "Medium",
    category: "Billing",
    assignee: "Dewi Lestari",
    group: "Billing",
    sentiment: "neutral",
    contact: { email: "bambang.sample@example.com", identities: [{ channel: "email", handle: "bambang.sample@example.com" }], tags: ["Fleet"] },
    history: [{ id: 290, subject: "Invoice servis Juli", status: "closed", at: "2026-08-29T09:30:00+07:00" }],
    thread: shortThread("Mohon dikirimkan invoice servis berkala bulan Agustus ke email ini.", at("24", "16:54:00"), "Email"),
  },
  {
    id: 377,
    customer: "Rina Kusuma",
    initials: "RK",
    channel: "facebook",
    account: "Ivosights",
    preview: "Sudah 3x saya komplain soal AC mobil tapi belum ada solusi!",
    time: "38m",
    createdAt: at("24", "12:57:00"),
    state: "out-sla",
    slaOverdue: "2h",
    replies: 2,
    views: ["progress", "escalated", "out-sla", "all"],
    status: "open",
    priority: "Urgent",
    category: "Complaint",
    assignee: "Rizky Pratama",
    group: "Dealer Support",
    lockedBy: "Rizky Pratama",
    sentiment: "negative",
    contact: {
      phone: "+62 813-0000-0377",
      identities: [{ channel: "facebook", handle: "Rina Kusuma (sample)" }],
      tags: ["VIP", "Repeat complaint"],
    },
    history: [
      { id: 341, subject: "AC tidak dingin setelah servis", status: "closed", at: at("10", "11:00:00") },
      { id: 359, subject: "AC masih bermasalah", status: "closed", at: at("18", "15:20:00") },
    ],
    thread: [
      { kind: "system", body: "Ticket created from Facebook", at: at("24", "12:57:00") },
      { kind: "in", body: "Sudah 3x saya komplain soal AC mobil tapi belum ada solusi!", at: at("24", "12:57:00") },
      {
        kind: "out",
        body: "Mohon maaf atas ketidaknyamanannya Kak Rina. Kami eskalasi ke tim dealer sekarang.",
        at: at("24", "13:20:00"),
        agent: "Rizky Pratama",
        delivery: "read",
      },
      {
        kind: "escalation",
        body: "Komplain AC ketiga kalinya untuk unit ini. Mohon jadwalkan pengecekan prioritas di dealer Kemang.",
        at: at("24", "13:21:00"),
        agent: "Rizky Pratama",
        to: "Dealer Support",
      },
      { kind: "system", body: "Locked by Rizky Pratama", at: at("24", "13:21:30") },
    ],
  },
  {
    id: 376,
    customer: "Yoga Saputra",
    initials: "YS",
    channel: "twitter",
    account: "@ivosights",
    preview: "Booking servis lewat aplikasi kok error terus ya min?",
    time: "52m",
    createdAt: at("24", "16:23:00"),
    state: "replied",
    replies: 4,
    views: ["progress", "all"],
    status: "open",
    priority: "High",
    assignee: "Intan Permata",
    group: "Digital",
    sentiment: "negative",
    contact: { identities: [{ channel: "twitter", handle: "@yoga.sample" }], tags: [] },
    history: [],
    thread: shortThread("Booking servis lewat aplikasi kok error terus ya min?", at("24", "16:23:00"), "Twitter DM"),
  },
  {
    id: 375,
    customer: "Maya Anggraini",
    initials: "MA",
    channel: "google-business",
    account: "Ivosights Jakarta",
    preview: "Jam operasional bengkel hari Minggu buka sampai jam berapa?",
    time: "1h",
    createdAt: at("24", "16:15:00"),
    state: "unreplied",
    replies: 0,
    views: ["unreplied", "progress", "all"],
    status: "open",
    priority: "Low",
    assignee: "Dewi Lestari",
    group: "Customer Care",
    sentiment: "neutral",
    contact: { identities: [{ channel: "google-business", handle: "Maya A. (sample)" }], tags: [] },
    history: [],
    thread: shortThread("Jam operasional bengkel hari Minggu buka sampai jam berapa?", at("24", "16:15:00"), "Google Business"),
  },
  {
    id: 374,
    customer: "Fajar Nugroho",
    initials: "FN",
    channel: "chat",
    account: "Sociomile Live Chat",
    preview: "Terima kasih, mobil sudah bisa diambil hari ini.",
    time: "2h",
    createdAt: at("24", "15:15:00"),
    state: "replied",
    replies: 5,
    views: ["my", "progress", "all"],
    status: "open",
    priority: "Low",
    assignee: "Pingot Testing",
    group: "Customer Care",
    sentiment: "positive",
    contact: { phone: "+62 811-0000-0374", identities: [{ channel: "chat", handle: "Visitor F4N1 · Sociomile Live Chat" }], tags: [] },
    history: [],
    thread: shortThread("Terima kasih, mobil sudah bisa diambil hari ini.", at("24", "15:15:00"), "Webchat"),
  },
  {
    id: 372,
    customer: "Lina Marlina",
    initials: "LM",
    channel: "email",
    account: "hello@ivosights.com",
    preview: "Lampiran STNK sudah saya kirim ulang, mohon dicek.",
    time: "3h",
    createdAt: at("24", "14:15:00"),
    state: "pending",
    replies: 2,
    views: ["my", "pending", "all"],
    status: "pending",
    priority: "Medium",
    assignee: "Pingot Testing",
    group: "Billing",
    sentiment: "neutral",
    contact: { email: "lina.sample@example.com", identities: [{ channel: "email", handle: "lina.sample@example.com" }], tags: [] },
    history: [],
    thread: shortThread("Lampiran STNK sudah saya kirim ulang, mohon dicek.", at("24", "14:15:00"), "Email"),
  },
  {
    id: 365,
    customer: "Hendra Gunawan",
    initials: "HG",
    channel: "facebook",
    account: "Ivosights",
    preview: "Oke kak, masalah sudah selesai.",
    time: "1d",
    createdAt: at("23", "10:41:00"),
    state: "replied",
    replies: 6,
    views: ["closed", "all"],
    status: "closed",
    priority: "Low",
    category: "Inquiry",
    assignee: "Sari Wulandari",
    group: "Customer Care",
    sentiment: "positive",
    contact: { identities: [{ channel: "facebook", handle: "Hendra G. (sample)" }], tags: [] },
    history: [],
    thread: [
      { kind: "system", body: "Ticket created from Facebook", at: at("23", "10:41:00") },
      { kind: "in", body: "Lampu indikator mesin menyala, aman dipakai jalan?", at: at("23", "10:41:00") },
      {
        kind: "out",
        body: "Sebaiknya dicek dulu ya Kak. Kami bantu booking servis besok jam 09.00 di dealer terdekat.",
        at: at("23", "10:48:00"),
        agent: "Sari Wulandari",
        delivery: "read",
      },
      { kind: "in", body: "Oke kak, masalah sudah selesai.", at: at("23", "16:02:00") },
      { kind: "system", body: "Ticket closed by Sari Wulandari", at: at("23", "16:05:00") },
    ],
  },
]

// `shortcut` is the slash code shown in the picker and matched by its search.
export const quickReplies = [
  { id: "greeting", shortcut: "greet", title: "Greeting", body: "Halo Kak, terima kasih sudah menghubungi Ivosights. Ada yang bisa kami bantu?" },
  { id: "vin", shortcut: "vin", title: "Ask for VIN", body: "Boleh dibantu nomor rangka (VIN) kendaraannya, Kak?" },
  { id: "follow-up", shortcut: "followup", title: "Follow-up in 3 days", body: "Permintaan Kakak sedang kami proses, estimasi 3 hari kerja. Kami kabari lagi ya." },
  { id: "closing", shortcut: "close", title: "Closing", body: "Terima kasih Kak, senang bisa membantu. Tiket ini akan kami tutup ya." },
]
