# JTS Grammar
JTS is a Typescript to Java transpiler. The grammar of JTS is similar to Typescript. The following is a list of the grammar rules that JTS supports.

## Variable Declaration
1. Untyped `let` declaration
```ts
let x = 5
```
to
```java
var x = 5
```

2. Untyped `const` declaration
```ts
const x = 5
```
to
```java
final var x = 5
```

3. Typed `let` declaration
```ts
let x: number = 5
```
to
```java
int x = 5
```

4. Typed `const` declaration
```ts
let x: string = "Hello"
```
to
```java
final String x = "Hello"
```

## Console Log
1. `console.log` statement
```ts
console.log("Hello World")
```
to
```java
System.out.println("Hello World")
```

2. `console.error` statement
```ts
console.error("Error Message")
```
to
```java
System.err.println("Error Message")
```

## Function Declaration
1. Function declaration with no parameters and no return type
```ts
function greet() {
    console.log("Hello World")
}
```
returns an error because JTS requires a return type annotation for functions.

2. Function declaration with no parameters and a return type
```ts
function greet(): void {
    console.log("Hello World")
}
```
to
```java
void greet() {
    System.out.println("Hello World");
}
```

3. Function declaration with untyped parameters
```ts
function add(a, b): number {
    return a + b
}
```
returns an error because JTS requires type annotations for function parameters.

4. Function declaration with typed parameters
```ts
function add(a: number, b: number): number {
    return a + b
}
```
to
```java
int add(int a, int b) {
    return a + b;
}
```

## Array Declaration
1. Typed Array declaration using `[]` syntax
```ts
let arr: number[] = [1, 2, 3]
let arr2d: number[][] = [[1, 2], [3, 4]]
```
to
```java
int[] arr = {1, 2, 3};
int[][] arr2d = {{1, 2}, {3, 4}};
```

2. Typed Array declaration using `Array<type>` syntax
```ts
let arr: Array<number> = [1, 2, 3]
const arr2d: Array<Array<number>> = [[1, 2], [3, 4]]
```
to
```java
ArrayList<Integer> arr = {1, 2, 3};
final ArrayList<ArrayList<Integer>> arr2d = {{1, 2}, {3, 4}};
```

3. Untyped Non-Empty Non-Mixed Array declaration (infers type)
```ts
let arr = [1, 2, 3]
let arr2d = [[1, 2], [3, 4]]
```
to
```java
int[] arr = {1, 2, 3};
int[][] arr2d = {{1, 2}, {3, 4}};
```

4. Untyped Empty Array declaration.
```ts
let arr = []
```
gives an error because JTS cannot infer the type of an empty array.
