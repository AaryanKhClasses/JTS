package test;

public class Main {
    public static void main(String[] args) { }

    void varTest() {
        var num1 = 20;
        final String str1 = "Hello";

        String[] arr1 = {"a","b","c"};
        int[] arr2 = {1,2,3};
        int[][] arr2d = {{1,2},{3,4}};
        int[] untypedArray = {1,2,3};
        final Object[] testArr = {1,"two",3.0,true};

        final ArrayList<String> arr3 = {"x","y","z"};
        ArrayList<Integer> arr4 = {4,5,6};
        ArrayList<ArrayList<Integer>> arr4d = {{7,8},{9,10}};
    }

    int[] funcTest(int a, int b) {
        int[] result = {a+b,a-b,a*b,a/b};
        return result;
    }

    void loopTest() {
        for(final var item : testArr) {
            System.out.println(item);
        }

        for(int i = 0; i < arr2.length; i++) {
            System.out.println(arr2[i]);
        }
    }
}
