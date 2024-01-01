<script setup>
import ParentLayout from '@vuepress/theme-default/layouts/Layout.vue'
import AI from './AI.vue'
import Comment from "../components/comment/comment.vue";
</script>

<template>
    <ParentLayout>
        <template #navbar-before>
            <AI/>
        </template>
      <template #page-bottom>
        <Comment/>
      </template>
    </ParentLayout>
</template>

<style lang="css">
.my-footer {
    text-align: center;
}
</style>
