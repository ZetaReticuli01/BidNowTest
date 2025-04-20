import React from 'react'

const StatusBadge = ({active,inactive,pending}) => {
  return (
    <div>
        <h1>
                <div style={{border:"1px solid", height:"70px", width:"30px",backgroundColor:active.color}}>Active</div>
        </h1>
        <h1>
                <div style={{border:"1px solid", height:"70px", width:"30px",backgroundColor:inactive.color}}>Inactive</div>
        </h1> 
        <h1>
                <div style={{border:"1px solid", height:"70px", width:"30px",backgroundColor:pending.color}}>Pending</div>
        </h1>       
    </div>
  )
}

export default StatusBadge