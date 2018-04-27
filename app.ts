import koa=require("koa");
import fileStatic=require("koa-static") 
import views = require('koa-views');
import Router =require("koa-router")
import bodyParser=require("koa-bodyparser")
import request=require("superagent");
let items = require('./www/data.json');
let app= new koa();
import mongoose = require('mongoose');

mongoose.connect('mongodb://118.31.72.227/test');

const List = mongoose.model('list', 
new mongoose.Schema({ title:String ,thumbnailsUrl:String,price:Number,score:String,gifUrl:String}));

var router=new Router()
router
.get('/home',async (ctx, next) => {
    let list =items.slice(0,20)
    // await ctx.render("home")
    let pageSize = Math.ceil(items.length /20);
    let pageArr = new Array(pageSize);
    pageArr.fill(0);
    await ctx.render("home",{list,pageArr})
  })
  .get("/page/:pageNum",async(ctx,next)=>{
      console.log(ctx.params.pageNum)
    let list =items.slice(ctx.params.pageNum*20-20,ctx.params.pageNum*20);
    let pageSize = Math.ceil(items.length /20);
    let pageArr = new Array(pageSize);
    pageArr.fill(0);
    
    console.log(pageArr)
      await ctx.render("home",{list,pageArr})

  })
  .get("/list",async(ctx,next)=>{
let {keyWord}=ctx.query;
var  list;
if(keyWord){
     list=await  List.find({title:new RegExp(keyWord,'g')}).exec();
}else{
     list=await List.find().exec()
}
    
      await ctx.render("admin/list",{list})
  })
  .get("/list/create",async(ctx,next)=>{
      await ctx.render("admin/create")
  })
  .get("/list/delete/:listId",async(ctx,next)=>{
   await  List.findByIdAndRemove(ctx.params.listId).exec()
   ctx.redirect("/list")
  })
  .get("/list/edit/:listId",async(ctx,next)=>{
      console.log(`hello`)
  let list=  await  List.findById(ctx.params.listId).exec()
  if(list){
   await ctx.render("admin/edit",{list})
  }else{
    await ctx.render("admin/edit",{list})  }
 
   })
   .post("/list/edit/:listId",async(ctx,next)=>{
       await List.findByIdAndUpdate(ctx.params.listId,ctx.request.body).exec();
       await ctx.redirect("/list")
   })
  .post("/list",async(ctx,next)=>{
  let   { title,thumbnailsUrl,price,score,gifUrl}=ctx.request.body
  await new List(ctx.request.body).save()
  let list=await List.find().exec()
  await ctx.render("admin/list",{list})
  })
  .get("/404",async(ctx,next)=>{
      await ctx.render("notFound")
  })
  .get("/login.html",async(ctx,next)=>{
 
      await ctx.render("login")
  })
app
.use(
    async(ctx,next)=>{
let starTime=new Date();

await next()
let endTime=new Date()
let timea=endTime.getMilliseconds()  -starTime.getMilliseconds()  
ctx.set("time",timea.toString())
}
)
.use(
    fileStatic(`${__dirname}/www`)
)
.use(
    (views(__dirname + '/template', {
        map: {
          html: 'swig'
        }
      }))
    )
    .use(bodyParser())
.use(router.routes())
.use(router.allowedMethods())
.listen("3000",()=>{
    console.log("服务器启动")
}) 


// const kitty = new Cat({ name: 'Zildjian' });
// kitty.save().then(() => console.log('meow'));