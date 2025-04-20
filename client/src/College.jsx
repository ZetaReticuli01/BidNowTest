import React from 'react'

 const College = ({name}) => {
    console.log(name)
   
  return (
    <div>
        {name.map((val,idx)=>(
            <h1 key={idx}>{val}</h1>
        ))}
    </div>
  )
}
export default College
 