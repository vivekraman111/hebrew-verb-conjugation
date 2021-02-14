const {conjugate} = require('./index.js')
const {dictionary, rootsSmallList, rootsCustomRules, rulesCustom} = require('./testData.js')

var notHeAlphabetRegex = new RegExp("[^\u05D0-\u05EA\u0020]", "g")

function TESTCONJ(conjData, refData) {
  return conjData.map((conjDataRow, i) => {
    if(i > refData.length - 1) return "NOT FOUND"
    let errCols = conjDataRow.map((conjStr, j) => {
                    let refStr = refData[i][j]
                    if(refStr.includes("\\")) refStr = refStr.split("\\")[0].trim()
                    else if(refStr.includes("~")) refStr = refStr.split("~")[1].trim()
                    else if(refStr.includes("|")) refStr = refStr.split("|")[1].trim().split(",")[0].trim()
                    refStr = refStr.replace(notHeAlphabetRegex, "")
                    return (conjStr === refStr ? false : "*" + (j + 1) + "* " + conjStr + "->" + refStr)
  }).filter(Boolean)
  return (errCols.length > 0 ? ("ERR: " + errCols.join(",") + " TOT: " + errCols.length) : "OK")
  })
}

function getRefData(rootsList, dictionary){
	return rootsList.map(root => {
						  for(let i = 0; i < dictionary.length; i++){
						    if(root[0] === dictionary[i][0] && root[1] === dictionary[i][1]) return dictionary[i]
						  }
						})
}

var testCases = [
	{
		name: "Small list",
		description: "Basic test of small list of roots",
		parameters: {
  				       conjugate: [rootsSmallList, undefined],
					   ref: getRefData(rootsSmallList, dictionary),
		}, 
		testResult: "OK",
	},
	{
		name: "Full (default) list",
		description: "Full list of roots used by default",
		parameters: {
		              conjugate: [undefined, undefined], 
		              ref: dictionary,
		},
		testResult: "OK",
	},
	{
		name: "Custom rules",
		description: "Use custom rules in conjugation",
		parameters: {
		              conjugate: [rootsCustomRules, rulesCustom], 
		              ref: getRefData(rootsCustomRules, dictionary),
		},
		testResult: "OK",
	},
]

testCases.forEach((testCase, i) => {
	test("Test case " + (i+1) + ": Name: " + testCase.name, () => {
		let testResults = TESTCONJ(conjugate(...testCase.parameters.conjugate)
									.map(resRow => resRow.slice(2, resRow.length - 2)),
								   testCase.parameters.ref.map(resRow => resRow.slice(4)))
		testResults.forEach(testResult => expect(testResult).toBe("OK"))
	  }
	)
})