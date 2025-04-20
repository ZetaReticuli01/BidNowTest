// import React,{useState} from "react"
// import axios from "axios"
// const Post=()=>{
// const [post,setPost]=useState({
//     title:'',
//     body:''
// })
// const handleClick=(e)=>{
//     setPost({...post,[e.target.name]:e.target.value})
// }
// const fetch=async(e)=>{
//     e.preventDefault()
//     try{
//     const res=await axios.post('https://jsonplaceholder.typicode.com/posts',post)
//     console.log(res.data)
//     }
//     catch(err){
//         console.log("errpr")
//     }
// }
// return(
//     <div>
//         <form onSubmit={fetch}>
//             Title:<input type="text" name="title"onChange={handleClick}></input><br></br>
//             Post:<input type="text" name="body"onChange={handleClick}></input>
//             <button>Submit</button>
//         </form>
//     </div>
// )

// }


// export default Post

/*import React,{useState} from "react"
import axios from "axios"


const Post=()=>{
    const [input,setInput]=useState(
    {
        name:"",
        email:""
    })
    const handleClick=(e)=>{
        setInput({...input,[e.target.name]:e.target.value})
    }
    const fetch=async(e)=>{
        e.preventDefault()
        try{
        const res=await axios.post("https://jsonplaceholder.typicode.com/posts",input)
        console.log(res.data)
        }
        catch(err){
            console.log("error")
        }
    }
    return(
        <div>
            <form onSubmit={fetch}>
            <input name="name" onChange={handleClick}type="text"></input><br></br>

            <input name="email" onChange={handleClick}type="email"></input>
            <button type="submit">Submit</button>
            </form>
        </div>
    )
}
export default Post*/


class Post extends React.Component{
    constructor(props){
        super(props)
        this.state={
            name:"",
            email:""
        }
    }
    handleClick=(e)=>{
        this.setState=({[e.target.name]:e.target.value})
    }
    fetch=async(e)=>{
        e.preventDefault()
        try{
            const res=await axios.post("https://jsonplaceholder.typicode.com/posts",this.state)
            console.log(res.data)
        }
        catch(err){
            console.log("Error")
        }
    }
}


/*
const retryPromise = (fn, maxRetries) => {
    return new Promise((res, rej) => {
        let attempts = 0;

        const attempt = () => {
            fn()
                .then(res) // If successful, resolve the promise
                .catch((err) => {
                    attempts++;
                    if (attempts < maxRetries) {
                        attempt(); // Retry if there are attempts left
                    } else {
                        rej("Failed after max retries"); // Reject after max retries
                    }
                });
        };

        attempt(); // Start the first attempt
    });
};

// Example unstable function (fails twice before succeeding)
let counter = 0;
const unstableFunction = () => {
    return new Promise((res, rej) => {
        counter++;
        if (counter === 3) res("Success!");
        else rej("Fail");
    });
};

// Test Cases
retryPromise(unstableFunction, 5)
    .then(console.log) // Expected output: "Success!" (on 3rd try)
    .catch(console.error);

counter = 0; // Reset counter for second test
retryPromise(unstableFunction, 2)
    .then(console.log)
    .catch(console.error); // Expected output: "Failed after max retries"


*/