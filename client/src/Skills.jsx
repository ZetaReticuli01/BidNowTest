import React,{useState} from "react";

const Skills=()=>{
    const [skills,setSkills]=useState([])
    const handleSkills=(e)=>{
        console.log(e.target.value,e.target.checked)
        if(e.target.checked){
            setSkills([...skills,e.target.value])
        }
        else{
            setSkills([...skills.filter((val)=>(val!=e.target.value))])
        }
    }
    return(
        <div>
            <input onChange={handleSkills}value="php"id="php"type="checkbox"></input>
            <label htmlFor="php">PHP</label><br/><br/>
            <input onChange={handleSkills}value="js"id="js"type="checkbox"></input>
            <label htmlFor="js">JS</label><br/><br/>
            <input  onChange={handleSkills}value="c"id="c"type="checkbox"></input>
            <label htmlFor="c">C</label><br/><br/>
            <input  onChange={handleSkills}value="python"id="python"type="checkbox"></input>
            <label htmlFor="python">Python</label>

           
            <h1>{skills.toString()}</h1>
        </div>
    
    )
}
export default Skills