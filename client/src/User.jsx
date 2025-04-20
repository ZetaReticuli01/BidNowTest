import React from 'react'

const User = ({name="Username"}) => {//default value
    console.log(name)
  return (
    <div>
        <h1>Hi,{name}</h1>
    </div>
  )
}

export default User