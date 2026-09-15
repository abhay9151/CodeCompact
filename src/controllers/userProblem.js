
const getLanguageId = require("../utils/getLanguageId");

// admin create kar sakta he 
const createProblem=async(req,res)=>{
    const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,starterCode,referenceSolution,problemCreator}=req.body;
    try{
        for(const {language,completeCode} of referenceSolution){
            //source code
            // language_id
            //stdin:
            //expected output

            const language_id=await getLanguageId(language);
            const submission=visibleTestCases.map((testCase)=>{
                return {
                    source_code:completeCode,
                    language_id:language_id,
                    stdin:testCase.input,
                    expected_output:testCase.output
                }
            });

        }
    }
    catch(err){
            console.log(err);
            res.status(500).json({message:"Internal server error"});
        }
    }
    // hamne ak batch create kardiya he problem ke testcases ka.
    // //const submission=[
    //     {
    //         "language_id": 71,
    //         "source_code": "print(input())",
    //         "stdin": "Hello, World!",   
    //         "expected_output": "Hello, World!"
    //     },
        
    // //]