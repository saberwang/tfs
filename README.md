# tfs

<p>之所以叫tfs，是因为阿里巴巴那玩意就叫tfs,后来想想应该叫gfs比较贴切， 写这玩意的时候阿里云的oss还没出现，tfs又太高级，就自己随便写了一个，自创代码不多，主要是把几个开源框架结合起来，既然是文件存储系统，nio语言是首选，分布式功能完全交给mongodb的grid file,实际测试下来性能超好</p>
<p>这玩意有什么用？可以用来放图片，视频，构建一个小型的图片或视频网站应该没啥问题，爱回收的图片都存在这个系统里，当然只是用来存储，当然大家用阿里云的oss更省心</P>

<h3>具体功能</h3>
<p>基于<strong>mongodb</strong>的<strong>gridfile</strong>的文件存储</p>
<p>前端采用express,完全二进制流输出，完全非阻塞</p>
<p>基于<strong>async</strong>并发执行代码，并且对图片加了imagemagick组件，可以实现动态缩放</p>
<p>通过Mongodb集群很容易实现分布式存储，同时grid file 自动对大体积文件进行切分所以读取也是分布式读取</p>
