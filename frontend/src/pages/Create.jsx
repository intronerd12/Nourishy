import React from 'react';

import Nav from '../Components/Layout/Nav';
import Title from '../Components/Layout/Title';


const Create = () => {
    return (
        <div className="container p-5">
           
            <Title name="create blog post"  subTitle="my sub title"/>
            <h1>CREATE POST</h1>
            <br />
            <form >
                <div className="form-group">
                    <label className="text-muted">Title</label>
                    <input type="text" className="form-control" placeholder="Post title" required />
                </div>
                <div className="form-group">
                    <label className="text-muted">Content</label>
                    <textarea type="text" className="form-control" placeholder="Write something.." required  />
                </div>
                <div className="form-group">
                    <label className="text-muted">User</label>
                    <input type="text" className="form-control" placeholder="Your name" required />
                </div>
                <div>
                    <button className="btn btn-primary">Create</button>
                </div>
            </form>
        </div>
    );

}


export default Create;