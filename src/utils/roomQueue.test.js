import test from "node:test";
import assert from "node:assert/strict";
import { getQueueDate, summarizeRoomQueue, compareQueueTickets, formatQueueNumber } from "./roomQueue.js";

const base = { id: "a", layanan: "Grooming", roomId: "grooming-1", tanggalRilis: "2026-11-03", jam: "09:00", queueSequence: 1, queueNumber: "G-001" };
test("only today's waiting and active tickets count; next uses schedule then number", () => {
  const tickets = [
    ...["WAITING", "aktif", "PENDING", "PAYMENT", "COMPLETED", "CANCELLED"].map((status) => ({ ...base, status })),
    { ...base, status: "WAITING", tanggalRilis: "2026-11-04" },
    { ...base, status: "WAITING", tanggalRilis: "2026-11-02" },
    { ...base, id: "b", status: "WAITING", jam: "09:30", queueSequence: 2, queueNumber: "G-002" },
  ];
  const summary = summarizeRoomQueue(tickets, "2026-11-03");
  assert.equal(summary.rooms[0].waiting, 2);
  assert.deepEqual(summary.rooms[0].current, ["G-001"]);
  assert.equal(summary.rooms[0].next.queueNumber, "G-001");
  assert.equal(summary.rooms[1].waiting, 0);
});

test("legacy and mismatched rooms are unassigned; rooms and services stay separate", () => {
  const common = { status: "WAITING", tanggalRilis: "2026-11-03" };
  const summary = summarizeRoomQueue([
    { ...common, layanan: "Grooming" },
    { ...common, layanan: "Klinik", roomId: "grooming-1" },
    { ...base, ...common, layanan: "Klinik", roomId: "dokter-2", queueNumber: "K-001", status: "aktif" },
    { ...common, layanan: "unknown" },
  ], "2026-11-03");
  assert.deepEqual(summary.unassigned, { Grooming: 1, Klinik: 1 });
  assert.equal(summary.rooms[0].waiting, 0);
  assert.equal(summary.rooms[3].active, 1);
});

test("schedule has priority over number; number breaks schedule ties", () => {
  const rows = [
    { ...base, id: "b", jam: "10:00" },
    { ...base, id: "c", queueSequence: 3 },
    { ...base, id: "d", queueSequence: 2 },
  ].sort(compareQueueTickets);
  assert.deepEqual(rows.map((row) => row.id), ["d", "c", "b"]);
  assert.equal(formatQueueNumber("Grooming", 1000), "G-1000");
  assert.equal(formatQueueNumber("Klinik", 2), "K-002");
});

test("Jakarta midnight switches the date and hides yesterday's tickets", () => {
  assert.equal(getQueueDate(new Date("2026-11-03T16:59:59Z")), "2026-11-03");
  const next = getQueueDate(new Date("2026-11-03T17:00:00Z"));
  assert.equal(next, "2026-11-04");
  const summary = summarizeRoomQueue([{ ...base, status: "WAITING" }], next);
  assert.equal(summary.rooms[0].waiting, 0);
  assert.equal(summary.rooms[0].next, null);
});
