const {rootsVerified, rulesDefault} = require('./configData.js')

/**************************************************/
/*    Common code used in more than one section   */
/**************************************************/

var he = {alef: "א", bet: "ב", gimmel: "ג", dalet: "ד", he: "ה", vav: "ו", zayin: "ז", het: "ח", tet: "ט",
          yod: "י", finalKaf: "ך", kaf: "כ", lamed: "ל", finalMem: "ם", mem: "מ", finalNun: "ן", nun: "נ",
          samekh: "ס", ayin: "ע", finalPe: "ף", pe: "פ", finalTsadi: "ץ", tsadi: "צ", qof: "ק", resh: "ר",
          shin: "ש", tav: "ת", qamats: "ָ", sheva: "ְ", segol: "ֶ", space: " "}

/* If the last char of the root is a final char it is replaced */
function normaliseLastRootChar(root){
  let lastChar = root[root.length - 1]
  if(finalLettersArr.includes(lastChar)) return (root.slice(0, root.length - 1) + normaliseChar(lastChar))
  else return root
}

/* If the char is a final char, the corresponding non final char is returned */
function normaliseChar(char){
  return (finalLettersArr.includes(char) ? replaceCharObj[char] : char)
}

var finalLettersArr = [he.finalKaf, he.finalMem, he.finalNun, he.finalPe, he.finalTsadi]

/**************************************************/
/*             Hebrew Conjugation                 */
/**************************************************/

var binyanim = "pa'al, pi'el, hiph'il, hitpa'el, huf'al, pu'al, nif'al".split(",").map(s => s.trim())

var regExpArr = [[/^$/, () => "true"],
                 [new RegExp("^(not )?(" + binyanim.join("|") + ")$"), binyanReplace],
                 [new RegExp("^(not )?(end|[1-4])=(end|[1-4]|" + Object.keys(he).join("$|") + ")"), charValReplace],
                 [new RegExp("^([" + String.fromCharCode(0x0591) + "-" + String.fromCharCode(0x05F4) + "]{3,4})/(" + binyanim.join("|") + ")$"),
                  rootSpecificReplace],
                ]

var finalLettersReplacementArr = [he.kaf, he.mem, he.nun, he.pe, he.tsadi]
var replaceCharObj = finalLettersArr.reduce((replaceObj, finalLetter, i) => {
  replaceObj[finalLetter] = finalLettersReplacementArr[i]
  replaceObj[finalLettersReplacementArr[i]] = finalLetter
  return replaceObj
}, Object.create(null))

var misplacedLettersRegex = new RegExp("[" + finalLettersArr.join("") + "].|[" + finalLettersReplacementArr.join("") + "]$")
                 
function charValReplace(match, p1, p2, p3, offset, string){
  let lhs, rhs
  if(p2 === "end") lhs = "root[root.length - 1]"
  else lhs = "root[" + (Number(p2) - 1) + "]"

  if(p3 === "end") rhs = "root[root.length - 1]"
  else if(p3 in he) rhs = "'" + normaliseChar(he[p3]) + "'"
  else rhs = "root[" + (Number(p3) - 1) + "]"

  return ((p1 ? "!" : "") + "(" + lhs + " === " + rhs + ")")
}

function binyanReplace(match, p1, p2, offset, string){
  return ((p1 ? "!" : "") + "(binyan === \"" + p2 + "\")")
}

function rootSpecificReplace(match, p1, p2, offset, string){
  return ("(root === \"" + normaliseLastRootChar(p1) + "\") && (" + "binyan === \"" + p2 + "\")")
}

function getStructuredRules(rules){
  return rules.map(ruleRow => ({ id: ruleRow[0],
                   ruleApplicabilityFn: conditionStrToFn(ruleRow[1], parseInt(ruleRow[0]) < 1000 ? " && " : " || "),
                   ruleContextArr: ruleRow.slice(2).map(ruleStr => ruleCsvToObj(ruleStr))}))
}

function conditionStrToFn(conditionStr, joinStr){
  let jsCondition = conditionStr.split(",").map(c => c.trim()).map(subCondition => {
    for(let i = 0; i < regExpArr.length; i++){
      let [regExp, replaceFn] = regExpArr[i]
      if(regExp.test(subCondition)) return subCondition.replace(regExp, replaceFn)
    }
    return subCondition
  }).join(joinStr)
  
  return (new Function("root", "binyan", "return Boolean(" + jsCondition + ")"))
}

function ruleCsvToObj(ruleCsv){
  if(ruleCsv === "") return []
  if(ruleCsv === "-") return ([{op: "-", pos: Symbol()}])
  var ruleObjArr = ruleCsv.split(",").map(ruleStr => {
    ruleStr = ruleStr.trim()
    let op  
    if(ruleStr.includes("@")) op = "@"
    else if(ruleStr.includes("~")) op = "~"
    else return ({pos: Symbol(), errMsg: "The operator in this rule is missing or not supported: " + ruleStr})
  
    let [insStr, pos] = ruleStr.split(op)
    let insArr = insStr.split("+").map(c => (c === "" ? c : he[c.trim()]))
    if(!["start", "end", "prefix", "suffix"].includes(pos.toLowerCase())){
      pos = Number(pos)
      if(isNaN(pos) || pos < 1 || pos > 4 || !insArr.every(c => (Boolean(c) || c === ""))){
        return ({pos: Symbol(), errMsg: "One or more parameters in this rule are not supported: " + ruleStr})
      }
    }
    return ({op, insArr, pos})
  })
  return deDuplicateObjArr(ruleObjArr, "pos")
}

function deDuplicateObjArr(objArr, keyField){
  return ([...new Map(objArr.map(obj => ([obj[keyField], obj]) )).values()])
}
             
function hasSuppressionOp(ruleObj){
  return ruleObj.op === "-"
}

function conjugate(roots=rootsVerified, rules=rulesDefault){
  let result = HECONJ(roots, rules)
  return roots.map((root, i) => root.concat(result[i]))
}
             
/**
 * Generates Hebrew verb conjugation.
 *
 * @param {Array<Array<string>>} roots Array of root + binyan pair
 * @param (Array<Array<string>>) rules The conjugation rules.
 * @return The conjugated forms
 * @customfunction
 */

function HECONJ(roots, rules) {
  let structuredRules = getStructuredRules(rules)
  let rulesCache = Object.create(null)
             
  return roots.map(([root, binyan]) => {
    root = normaliseLastRootChar(root)
    let applicableRules = structuredRules.filter(rule => rule.ruleApplicabilityFn(root, binyan))
    let applicableRulesSignature = ("-" + applicableRules.map(rule => rule.id).join("-") + "-")
    let applicableRulesMergedArr = rulesCache[applicableRulesSignature]
    if(!applicableRulesMergedArr){
             applicableRulesMergedArr = applicableRules.map(rule => rule.ruleContextArr.map(ruleArr => ruleArr.map(ruleObj => {
                  ruleObj.ruleId = rule.id
                  return ruleObj
                })))
             .reduce((mergedRule, rule) => {
                return (mergedRule.map((contextRule, i) => contextRule.concat(rule[i])))
              }, Array.from({length:structuredRules[0].ruleContextArr.length}, () => new Array()))
              // The reduce fn has been initialized in case no rules are applicable.
              
      applicableRulesMergedArr = applicableRulesMergedArr.map(contextRule => deDuplicateObjArr(contextRule, "pos"))
      rulesCache[applicableRulesSignature] = applicableRulesMergedArr
    }
    
    let specialRulesPosCsv = applicableRulesMergedArr
             .map((ruleArr, i) => (ruleArr.some(ruleObj => ruleObj.ruleId >= 100) ? (i + 1) : false))
             .filter(Boolean).join(",")

    return applicableRulesMergedArr.map(ruleArr => {
                 let rootPosArr = Array.from({length: root.length}, (_, i) => i + 1)
                 if(ruleArr.some(rule => rule.hasOwnProperty("errMsg"))){
                   return ("ERR: " + ruleArr.map(rule => rule.errMsg).filter(Boolean).join(", "))
                 }
  
                 // inefficient
                 if(ruleArr.some(hasSuppressionOp)) return ""
                 
                 let processedStr = ruleArr.reduce((str, rule) => {
                   let adjustedPos
                   
                   if(typeof rule.pos === "string"){
                     if(rule.pos.toLowerCase() === "end") adjustedPos = rootPosArr[root.length - 1] + (rule.op === "~" ? 0 : 1)
                     else if(rule.pos.toLowerCase() === "start") adjustedPos = rootPosArr[0]
                     else if(rule.pos.toLowerCase() === "prefix") adjustedPos = 1
                     else if(rule.pos.toLowerCase() === "suffix") adjustedPos = str.length + 1
                   }
                   else {
                     if(rule.pos > root.length){
                       return ("ERR: Position specified in this rule exceeds the root length")
                     }
                     adjustedPos = rootPosArr[rule.pos - 1]
                   }
                   
                   let trimChars = rule.op === "~" ? 1 : 0
                   let insStr = rule.insArr.join("")
                   let result = str.slice(0, adjustedPos - 1) +
                                insStr +
                                str.slice(adjustedPos - 1 + trimChars)
                                
                   rootPosArr = rootPosArr.map(rootPos => (rootPos >= adjustedPos ? rootPos + insStr.length - trimChars : rootPos))
                   return result
                 }, root)
                 
                 if(misplacedLettersRegex.test(processedStr)){
                   processedStr = Array.from(processedStr, (c, i) => {
                                    if((finalLettersArr.includes(c) && i < processedStr.length - 1) ||
                                       (finalLettersReplacementArr.includes(c) && i === processedStr.length - 1)){
                                         return replaceCharObj[c]
                                    }
                                    return c
                                  }).join("")
                 }
                 return processedStr
             }).concat([applicableRulesSignature, specialRulesPosCsv])
           })
}

module.exports = {conjugate};