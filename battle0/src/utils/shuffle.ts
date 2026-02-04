/**
 * 使用 Fisher-Yates 算法对数组进行原地洗牌
 * @param array 需要被洗牌的数组
 */
export function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;

    // 当还剩下元素可以洗时
    while (currentIndex !== 0) {
        // 随机挑选一个剩下的元素
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // 将它与当前元素交换
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}