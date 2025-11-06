import React from 'react'

const Title = ({name, subTitle}) => {
    console.log(name, subTitle)
    return (
         <div>
            <h1>{name}</h1>
            {/* <div>{subTitle}</div> */}
            {subTitle ? <h2>{subTitle}</h2> : <p>no sub title</p>}
        </div>

    )
}

export default Title