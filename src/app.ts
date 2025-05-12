import express from 'express'
import userrouter from './routers/user.routes';

const app = express()
const port = 3000;

app.use(express.json())
app.use('/user', userrouter)



app.listen(port, () =>
{
    console.log(`Example app listening on port ${port}`)
})


