# Hebrew verb conjugation

Given a list of [Hebrew verb roots](https://en.wikipedia.org/wiki/Modern_Hebrew_verbs) and conjugation rules, this library produces the verb conjugation. Note that the library does not return static data but dynamically generates the conjugations from the root/s based on the rules. If the rules are not provided, they default to the internally configured set of rules. If neither the roots nor the rules are provided, the function returns the conjugation of the full set of verified roots which can be found in the spreadsheet (see below) The verified roots have been checked against cannonical sources. However if the default rules are used to conjugate a root that is not in the verified list without providing the rules, it may or may not be correct due to the immaturity of this library and the large number of exceptions in Hebrew verb conjugation.

The working of this code and the format of the rules can be understood by referring to [this spreadsheet](https://docs.google.com/spreadsheets/d/1nsN1qrsldy3veRWVCV-ubuRKOJ8MObLFb9XzamauUJI/edit#gid=1208745120) 

The objective of this spreadsheet is to identify the complete set of rules based on which Hebrew verbs are conjugated and present them in a readable format. It's easier to learn the rules rather than memorise the conjugations.

The "conjugation" tab contains a list of roots in columns A & B. The script running within the spreadsheet uses the rules listed in the "rules" tab to conjugate these roots and displays the results column E onwards.

For each root, the full set of rules is checked to find which rules apply. This is done based on the "condition" column in the rules tab.

The condition is a comma separated list of clauses. If the condition is blank it means that it applies to all roots. There may also be just a single clause. The clause may just be the binyan, in which case it applies to all roots of the binyan. Alternatively it may be of the format a=b where a is the position of a root character and b could be a Hebrew letter (written in English for convenience) or a position. For e.g. if the condition is 2=3, it means that this rule applies to all roots that have the same letter in position 2 and position 3.

Each condition has an Id which appears against each conjugation (column AG of the conjugation tab) so you know exactly which rules were applied to conjugate that root. There are three types of rules. Basic rules with Id from 1 to 99 (binyan specific only), Generic rules with Id from 100 to 999 (binyan + other conditions but not root specific) and Root specific rules from Id 1000 onwards. The conjugated forms to which rules with id 100 onwards are applied are highlighted in green. The rules have been configured in a naive way to achieve the desired results since I'm not an expert in Hebrew grammar. There are surely much more efficient ways of configuring the rules and this will be achieved over time.

The rules in column C onwards of the rules tab are of the format <text><operator><position>. The text consists of hebrew letters written in English separated with a plus sign if there is more than one. The text may also be blank. The operator indicates what is to be done with the text. At sign @ means the text is to be inserted at the specified position. Tilda ~ means that the root letter at the specified position is to be replaced with the text. For e.g. "yod+finalMem@suffix" means add a suffix of ים "yod~1" means replace the first root character with a yod. "~2" means delete the second root character.

The number of roots that a rule applies to can be seen in column AF. You can see that there is a long tail of rules (approx 80% of conjugations from 15% of rules)

The "dictionary" tab contains reference data used to verify that the conjugations generated by the program are correct. The reference data contains niqqud however the conjugation tab does not cover niqqud as yet. The status of the comparison between the generated conjugation and the reference data can be seen in column AI of the "conjugation" tab. "OK" indicates that they match.

The "practice" tab allows you to revise the rules by entering them yourself. The % correct is shown in the top left corner. Wrong conjugations are highlighted in yellow. If you want to use this tab, you need to make a copy of this spreadsheet since it is read only.

If you find this useful and would like the sheet to be updated, leave a comment.

```shell
$ npm install hebrew-verb-conjugation
```

```javascript
const hvc = require('hebrew-verb-conjugation')

//ES2015 modules
import hvc from 'hebrew-verb-conjugation'

const rootsSmallList =
[["זכר","pa'al"],
["דבר","pi'el"],
["סבר","hiph'il"],
["שמש","hitpa'el"],
["סבר","huf'al"],
["דבר","pu'al"],
["זכר","nif'al"]]

hvc.conjugate(rootsSmallList)

/*
Note: Mixing English and Hebrew has inverted the direction of the Hebrew text
      However this appears correctly in the program
[
  [
    'זכר', "pa'al",
    'זוכר', 'זוכרת', 'זוכרים', 'זוכרות',
    'זכרתי', 'זכרנו', 'זכרת', 'זכרת', 'זכרתם', 'זכרתן', 'זכר', 'זכרה', 'זכרו',
    'אזכור', 'נזכור', 'תזכור', 'תזכרי', 'תזכרו', 'תזכורנה', 'יזכור', 'תזכור','יזכרו', 'תזכורנה',
    'זכור', 'זכרי', 'זכרו', 'זכורנה',
    'לזכור',
    '-1-2-1008-',
    '14,15,16,19,20,21,23,24,27'
  ],
  [
    'דבר',    "pi'el",  'מדבר',   'מדברת',
    'מדברים', 'מדברות', 'דיברתי', 'דיברנו',
    'דיברת',  'דיברת',  'דיברתם', 'דיברתן',
    'דיבר',   'דיברה',  'דיברו',  'אדבר',
    'נדבר',   'תדבר',   'תדברי',  'תדברו',
    'תדברנה', 'ידבר',   'תדבר',   'ידברו',
    'תדברנה', 'דבר',    'דברי',   'דברו',
    'דברנה',  'לדבר',   '-1-3-',  ''
  ],
  [
    'סבר',    "hiph'il", 'מסביר',
    'מסבירה', 'מסבירים', 'מסבירות',
    'הסברתי', 'הסברנו',  'הסברת',
    'הסברת',  'הסברתם',  'הסברתן',
    'הסביר',  'הסבירה',  'הסבירו',
    'אסביר',  'נסביר',   'תסביר',
    'תסבירי', 'תסבירו',  'תסברנה',
    'יסביר',  'תסביר',   'יסבירו',
    'תסברנה', 'הסבר',    'הסבירי',
    'הסבירו', 'הסברנה',  'להסביר',
    '-1-4-',  ''
  ],
  [
    'שמש', "hitpa'el",
    'משתמש', 'משתמשת', 'משתמשים', 'משתמשות',
    'השתמשתי','השתמשנו', 'השתמשת', 'השתמשת', 'השתמשתם','השתמשתן',
    'השתמש', 'השתמשה', 'השתמשו',
    'אשתמש', 'נשתמש', 'תשתמש', 'תשתמשי', 'תשתמשו', 'תשתמשנה', 'ישתמש', 'תשתמש', 'ישתמשו', 'תשתמשנה',
    'השתמש', 'השתמשי', 'השתמשו', 'השתמשנה',
    'להשתמש',
    '-1-5-125-',
    '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28'
  ],
  [
    'סבר',     "huf'al",  'מוסבר',   'מוסברת',
    'מוסברים', 'מוסברות', 'הוסברתי', 'הוסברנו',
    'הוסברת',  'הוסברת',  'הוסברתם', 'הוסברתן',
    'הוסבר',   'הוסברה',  'הוסברו',  'אוסבר',
    'נוסבר',   'תוסבר',   'תוסברי',  'תוסברו',
    'תוסברנה', 'יוסבר',   'תוסבר',   'יוסברו',
    'תוסברנה', '',        '',        '',
    '',        '',        '-1-6-',   ''
  ],
  [
    'דבר',     "pu'al",   'מדובר',  'מדוברת',
    'מדוברים', 'מדוברות', 'דוברתי', 'דוברנו',
    'דוברת',   'דוברת',   'דוברתם', 'דוברתן',
    'דובר',    'דוברה',   'דוברו',  'אדובר',
    'נדובר',   'תדובר',   'תדוברי', 'תדוברו',
    'תדוברנה', 'ידובר',   'תדובר',  'ידוברו',
    'תדוברנה', '',        '',       '',
    '',        '',        '-1-7-',  ''
  ],
  [
    'זכר',     "nif'al",  'נזכר',
    'נזכרת',   'נזכרים',  'נזכרות',
    'נזכרתי',  'נזכרנו',  'נזכרת',
    'נזכרת',   'נזכרתם',  'נזכרתן',
    'נזכר',    'נזכרה',   'נזכרו',
    'אזכר',    'ניזכר',   'תיזכר',
    'תיזכרי',  'תיזכרו',  'תיזכרנה',
    'ייזכר',   'תיזכר',   'ייזכרו',
    'תיזכרנה', 'היזכר',   'היזכרי',
    'היזכרו',  'היזכרנה', 'להיזכר',
    '-1-8-',   ''
  ]
]


*/


```