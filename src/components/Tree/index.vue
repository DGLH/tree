<template>
    <div>
        <Node
            v-for="(child, index) in node"
            :index="index"
            :node="child"
            :hierarchy="index + ''"
            :class-name="className"
            :tree="tree"
        />
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import Node from './node.vue';
import Tree from './tree';
import type { TreeNode } from './type';

interface Props {
    className?: string;
    node: Array<TreeNode>;
    change?: (value: string[]) => void;
}
const props = defineProps<Props>();

const tree = reactive<Tree>(new Tree(props.change));
</script>
