<template>
  <div class="gitalk-container">
    <div id="gitalk-container"></div>
  </div>
</template>
<script>
export default {
  name: 'comment',
  data() {
    return {};
  },
  mounted() {
    let body = document.querySelector('.gitalk-container');
    let script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js';
    body.appendChild(script);
    script.onload = () => {
      const commentConfig = {
        clientID: '98d89f5a741c2932b4b3',
        clientSecret: '78b8a32f24361f9f8535e8f31ecfafb1464f96c4',
        repo: 'myDocs',
        owner: 'Chenzhexian',
        // 这里接受一个数组，可以添加多个管理员
        admin: ['Chenzhexian'],
        // id 用于当前页面的唯一标识，一般来讲 pathname 足够了，
        id:location.hash.slice(0, 50),
        title: 'commentGitTalk',
        distractionFreeMode: false,
      };
      const gitalk = new Gitalk(commentConfig);
      gitalk.render('gitalk-container');
    };
  },
};
</script>
<style>
@import '../css/gittalk.css';
</style>