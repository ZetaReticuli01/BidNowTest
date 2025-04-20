import React from 'react'

const BidButton = ({props}) => {
  return (
    <div style={{
        border:"1px solid pink",
        padding:"10px",
        margin:"10px",
        width:"400px",
        borderRadius:"10px",
        backgroundColor:"white"
    }}>
        <h3>Name: <span style={{color:"green"}}>{props.user}</span></h3>
        <h3>Amount: <span style={{color:"green"}}>{props.amount}</span></h3>
        <h3>Time:<span style={{color:"green"}}>{props.time}</span></h3>
    </div>
  )
}

export default BidButton