<template>
    <div
        :style="`margin-left: ${hierarchy.split('&').length * 20}px`"
        class="tree_node"
        :class="className"
        ref="container"
    >
        <span class="triangle_span">
            <img
                v-if="node.children?.length"
                :src="triangle"
                alt="triangle"
                :class="triangleClass"
                @click="handlTriangleClick"
            />
        </span>
        <span
            class="check_box_span"
            :class="{ active_select: selected, parter_active: !selected && selectChildren > 0 }"
            @click="select"
        />
        {{ node.label }}
    </div>

    <template v-if="node.children?.length">
        <div ref="nodes" class="hidden">
            <TreeNode
                v-for="(child, index) in node.children"
                :index="index"
                :node="child"
                :hierarchy="hierarchy + '&' + index"
                :class-name="childrenClassName"
                :tree="tree"
                ref="nodesRef"
                @change="childChange"
            />
        </div>
    </template>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import triangle from '../../assets/triangle.svg';
import { trigger } from './utils';
import Tree from './tree';
import type { TreeNode } from './type';

interface Props {
    className?: string;
    node: TreeNode;
    hierarchy: string;
    index: string | number;
    tree: Tree;
}

const props = withDefaults(defineProps<Props>(), { className: '' });

interface Emits {
    (event: 'change', select: 1 | 0.5 | -1 | -0.5): void;
}

const emits = defineEmits<Emits>();

// 当前是否是展开状态
let isUnfold = true;
let isRunning = false;

//#region 元素的展开收起区域
const triangleClass = ref('triangle');
const childrenClassName = ref(props.className);
const container = ref<Element>();
const nodes = ref();
let triggerFn = null;
onMounted(() => {
    triggerFn = trigger(nodes.value, isUnfold);
});

const handlTriangleClick = () => {
    if(isRunning) return;
    isRunning = true;
    if (isUnfold) {
        triangleClass.value = 'triangle rotate90';
    } else {
        triangleClass.value = 'triangle';
    }
    setTimeout(() => {
        isRunning = false;
    }, 300)
    triggerFn!(nodes.value, true);
    isUnfold = !isUnfold;
};
//#endregion

const tree = props.tree;
const selected = ref(false);
// 当前选中的子元素的数量，0.5 代表下级的子元素是半选状态，1 代表下级子元素被选中，当前值等于子元素的值就代表子元素全选中
let selectChildren = ref(0);

/**
 * @description: 选中一个元素后，要依层级依次告知父级，如果所有的子元素都被选中，就要给父级传递值 1，如果只是选中了部分子元素，就给自己的父级传递 0.5
 * @param {1 | 0.5 | -1 | -0.5} select 子元素发生变化的时候，传递给父元素一个选中的值，0.5 代表有子元素被选中/取消，但是没有全选/全部取消，1代表有子元素被全选/全部取消
 */
const childChange = (select: 1 | 0.5 | -1 | -0.5) => {
    selectChildren.value += select;
    // 当选中子元素的数量最开始是 0 的时候，认为最开始状态是没有选中子元素
    //  从 0 开始的话，可以直接给父级传递值 1 或 0.5 而不用考虑其他
    if (selectChildren.value - select === 0) {
        // 当选中的子元素数量是当前元素的子元素的数量的时候，要选中当前元素，并且直接向当前元素的父级传递值 1
        if (selectChildren.value === props.node.children!.length) {
            selected.value = true;
            tree.add(props.node.key);
            emits('change', 1);
        } else {
            emits('change', 0.5);
        }
        // 当当前选中子元素的值是当前元素的子元素的数量且初始值不是 0 的时候
    } else if (selectChildren.value === props.node.children!.length) {
        selected.value = true;
        tree.add(props.node.key);
        emits('change', 0.5);
        // 排除上面两种情况，即初始不是 初始没有选中任何子元素 和 选中子元素后当前元素所有子元素都被选中 状态
        // 当前选中/去掉子元素之后不是当前元素的子元素的数量且初始值不是 0 的时候
    } else if (selectChildren.value === 0) {
        if (selected.value) {
            selected.value = false;
            tree.sub(props.node.key);
            emits('change', -1);
        } else {
            emits('change', -0.5);
        }
    } else if (selectChildren.value !== props.node.children!.length) {
        // 如果选中/去掉之前，元素状态是选中的状态，就要勾掉当前元素的选中态，并且告诉当前元素的父元素其选中态被勾掉
        if (selected.value) {
            selected.value = false;
            tree.sub(props.node.key);
            emits('change', -0.5);
        }
    }
};

// 所有的子元素的 ref，是一个数组
const nodesRef = ref<{ fatherChange: (type: 'select' | 'remove') => void }[] | null>(null);

/**
 * @description: 当父元素发生变化的时候，子元素也要跟着全选或者全部取消
 * @param {'select' | 'remove'} type 选择/取消选择
 */
const fatherChange = (type: 'select' | 'remove') => {
    // 当父元素被选择的时候，如果当前元素是已经非选中状态，那么就需要将当前元素选中
    if (type === 'select' && !selected.value) {
        selected.value = true;
        tree.add(props.node.key);
        if (nodesRef.value) {
            selectChildren.value = props.node.children!.length;
            nodesRef.value.forEach((ele) => {
                ele.fatherChange('select');
            });
        }
        // 当父元素被移除选择
    } else if (type === 'remove') {
        selected.value = false;
        tree.sub(props.node.key);

        // 如果当前元素还有子元素，就要向子元素传递移除的操作
        if (nodesRef.value) {
            selectChildren.value = 0;
            nodesRef.value.forEach((ele) => {
                ele.fatherChange('remove');
            });
        }
    }
};

/**
 * @description: 当前元素的选择操作
 */
const select = () => {
    selected.value = !selected.value;
    // 如果当前元素被选中
    if (selected.value) {
        tree.add(props.node.key);
        // 当前元素选中操作之前，如果已经子元素被选中，那么在子元素被选中的时候已经向当前元素的父元素传递了 0.5，所以在当前元素被选中的时候，只需要在向父元素传递 0.5 既可
        // 即当前元素能够向父元素传递的值最大是 1，如果一个元素被选中那么就要向父元素传递 1，但是如果一个元素只有其下的某几个子元素被选中，但是不是全部子元素，那么当前元素应该只向父元素传递 0.5 既可，即告诉父元素应该展示半选状态
        if (selectChildren.value > 0) {
            emits('change', 0.5);
        } else {
            emits('change', 1);
        }
        // 将子元素也同时选中
        if (nodesRef.value) {
            selectChildren.value = props.node.children!.length;
            nodesRef.value.forEach((ele) => {
                ele.fatherChange('select');
            });
        }
        // 元素被移除时，给父级传递 -1 告诉父级移除状态
    } else {
        tree.sub(props.node.key);
        emits('change', -1);

        if (nodesRef.value) {
            selectChildren.value = 0;
            nodesRef.value.forEach((ele) => {
                ele.fatherChange('remove');
            });
        }
    }

    // 在树的操作向上向下传递完后，一次性触发树的 change 事件
    tree.triggerChange();
};

defineExpose({ fatherChange });
</script>

<script lang="ts">
export default {
    name: 'TreeNode',
};
</script>

<style>
.tree_node {
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
    height: var(--node_height);
}
.triangle_span {
    display: inline-block;
    width: 16px;
    height: 16px;
}
.triangle {
    width: 16px;
    height: 16px;
    transition: all 0.3s;
    cursor: pointer;
}
.triangle.rotate90 {
    transform: rotate(-90deg);
}
.hidden {
    overflow: hidden;
}

.check_box_span {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    border-collapse: separate;
    cursor: pointer;
    position: relative;
    transition: all 0.3s;
}
.check_box_span::after {
    position: absolute;
    top: 0;
    inset-inline-start: 0;
    width: 20%;
    height: 30%;
    content: '';
    transition: all 0.3s;
    opacity: 0;
    border: 2px solid #fff;
    border-color: transparent #fff #fff transparent;
    transform: rotate(45deg) scale(1) translate(55%, -25%);
}
.check_box_span.active_select {
    background-color: #1677ff;
}
.check_box_span.active_select::after {
    opacity: 1;
}
.check_box_span::before {
    position: absolute;
    top: 50%;
    left: 50%;
    content: '';
}
.check_box_span.parter_active::before {
    opacity: 1;
    transform: translate(-50%, -50%);
    border: none;
    width: 50%;
    height: 50%;
    background-color: #1677ff;
}
</style>
