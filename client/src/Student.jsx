import React from 'react'

const Student = (props) => {
    console.log(props)
  return (
    <div>
        <h1>{props.props}</h1>
    </div>
  )
}

export default Student