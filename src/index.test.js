const hvc = require('./index.js')

const he = { alef: "א",  bet: "ב",  gimmel: "ג",  dalet: "ד",  he: "ה",  vav: "ו",  zayin: "ז",  het: "ח",  tet: "ט",  yod: "י",  finalKaf: "ך",  kaf: "כ",  lamed: "ל",  finalMem: "ם",  mem: "מ",  finalNun: "ן",  nun: "נ",  samekh: "ס",  ayin: "ע",  finalPe: "ף",  pe: "פ",  finalTsadi: "ץ",  tsadi: "צ",  qof: "ק",  resh: "ר",  shin: "ש",  tav: "ת",  qamats: "ָ",  sheva: "ְ",  }

test("test if the function says hello without str", () => (
    expect(hvc.sayHello()).toBe("hello!")
  ))

test("test if the function says hello with str", () => (
    expect(hvc.sayHello("world")).toBe("hello world!")
  ))