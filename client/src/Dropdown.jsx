import React, { useState } from 'react'
import Clock from './Clock'
const Dropdown = () => {
  const [color,setColor]=useState("red")
  return (
    <div>
        <select onChange={(e)=>{setColor(e.target.value)}}name="color" id="color">
            <option value="red">Red</option>
            <option value="blue">Blue</option>
            <option value="yellow">Yellow</option>
            <option value="green">Green</option>
        </select>
        <Clock props={color}/>
    </div>
  )
}

export default Dropdown