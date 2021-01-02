import React from 'react';
import './Post.css';
import Avatar from '@material-ui/core/Avatar';

/*Functional Component specifying the layout of a post*/
function Post({username, imageUrl, caption}) {
  return (
    <div className="post">

    {/*header (avatar + username)*/}
    <div className="post_header">
      {/*MaterialUI user avatar*/}
      <Avatar
        className="post_avatar"
        alt= {username}
        src="/static/images/avatar/1.jpg"
      />

      <h3>{username}</h3>
    </div>

    {/*image*/}
    <img className="post_image" src={imageUrl} alt={username}/>

    {/*caption*/}
    <h4 className="post_text"><strong>{username}</strong> {caption}</h4>

    </div>

  )
}

export default Post
