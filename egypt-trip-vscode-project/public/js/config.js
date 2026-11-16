// Ticket times are the source of truth. Change these if your boarding pass differs.
// Times include IANA time zones so countdowns remain correct wherever the page is viewed.
window.TRIP_CONFIG = {
  tripStart: "2026-11-20T18:25:00-06:00", // BA222, Nashville local time
  flights: [
    { number:"BA222", from:"BNA", fromName:"NASHVILLE", to:"LHR", toName:"LONDON", departure:"2026-11-20T18:25:00-06:00", arrival:"2026-11-21T08:55:00+00:00", label:"NASHVILLE → LONDON", apiDate:"2026-11-20" },
    { number:"BA398", from:"LHR", fromName:"LONDON", to:"CAI", toName:"CAIRO", departure:"2026-11-21T14:25:00+00:00", arrival:"2026-11-21T21:05:00+02:00", label:"LONDON → CAIRO", apiDate:"2026-11-21" },
    { number:"BA399", from:"CAI", fromName:"CAIRO", to:"LHR", toName:"LONDON", departure:"2026-11-28T06:40:00+02:00", arrival:"2026-11-28T10:15:00+00:00", label:"CAIRO → LONDON", apiDate:"2026-11-28" },
    { number:"BA223", from:"LHR", fromName:"LONDON", to:"BNA", toName:"NASHVILLE", departure:"2026-11-28T12:40:00+02:00", arrival:"2026-11-28T16:50:00+02:00", label:"LONDON → NASHVILLE", apiDate:"2026-11-28" }
  ],
  locations: [
    { start:"2026-11-16T00:00:00-06:00", end:"2026-11-20T18:25:00-06:00", city:"Nashville", sub:"TENNESSEE, USA", note:"The countdown is on. Next stop: Cairo." },
    { start:"2026-11-21T21:05:00+02:00", end:"2026-11-23T00:00:00+02:00", city:"Cairo", sub:"EGYPT", note:"We've made it to Egypt." },
    { start:"2026-11-23T00:00:00+02:00", end:"2026-11-25T12:00:00+02:00", city:"Alexandria", sub:"MEDITERRANEAN COAST, EGYPT", note:"A couple of days by the Mediterranean." },
    { start:"2026-11-25T12:00:00+02:00", end:"2026-11-28T06:40:00+02:00", city:"Cairo", sub:"EGYPT", note:"Back in Cairo until departure day." }
  ]
};
