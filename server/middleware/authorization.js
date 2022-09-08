let authorization = (req, res, next ) => {
  if( req.headers.authorization !== process.env.REACT_APP_AUTHORIZATION)
    return res.status(401)

  next()
}

module.exports = authorization