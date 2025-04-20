import React,{useState,useEffect} from 'react'
const Clock = ({props}) => {
    const [time,setTime]=useState(0)
    useEffect(()=>{
        setInterval(()=>{
            setTime(new Date().toLocaleTimeString())
        },1000)
    },[])//if array is empty then it is in mount phase
  return (
    <div style={{border:"1px solid",backgroundColor:"beige",width:"500px",height:"200px",borderRadius:"20px"}}>
        <h2 style={{color:props,display:"grid", placeContent:"center"}}>{time}</h2>
    </div>
    )
}

export default Clock