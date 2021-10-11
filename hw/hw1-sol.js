
// 1
function sumFirstNFn(n , transformer ){

	return  Array.from({length:n}, ( _, i ) => i + 1)
		 		.map(transformer)
		    	.reduce( (prev,curr) => prev + curr , 0 )

}

// 2
function parity( n ){

	return (n).toString(2)
			  .split('')
			  .reduce( (prev,curr) => prev + (curr === '1' ? 1 : 0 ) , 0 ) % 2 
}

// 3
function rotCipher( text , n=13){

    const lc = ['A','a','Z','z'].map(e=> e.charCodeAt(0))
    return Array.from(text)
        .map( (e,index) => {
            if(e>='a' && e<='z'){
                const code = text.charCodeAt(index) + n
                if(code > lc[3]) return String.fromCharCode(lc[1] + code - lc[3] -1)
                else return String.fromCharCode(code);
            }
            else if(e>='A' && e<='Z') {
                const code = text.charCodeAt(index) + n
                if (code > lc[2]) return String.fromCharCode(lc[0] + code - lc[2] -1)
                else return String.fromCharCode(code);
            }
            else
                return e;
        })
        .join('')
}

// 4
function mapBinaryFn( binaryFn , ar1, ar2){ 
   
   return ar1.map( (e,index) => binaryFn( e ,ar2[index]))
}

// 5
function rmapBinaryFn( binaryFn , ar1 ){ 
   
   return ar1.map( (e,index) => binaryFn( e ,ar1[ar1.length - index - 1 ]))
}

// 6
function partialProducts( ar ){
    return ar.slice(1).reduce( (acc, curr,index ) =>
        acc.concat( [acc[index] *   curr ] )
    ,[ar[0]])
}

// 7 
function partialAppl( fn, ar ){
   return ar.reduce( (prev, curr) => { 
   		 prev.concat( prev.length === 0 ? curr :   fn( prev[prev.length-1], curr ) ) ; 
   		 return prev;
    } ,[] )
}

// 8 
function nPermutations( ar ) { 
      return Array.from({length: ar.length }, (_, i) => i + 1)
      			  .reduce((prev , curr ) => prev * curr   ); 
   
}

// 9
function fib( n ){

	 return Array.from({length: n}, (_, i) => i+2 ).reduce((acc , curr ,index ) => {
        return  acc.concat([acc[curr-1] + acc[curr-2]])
    },[0,1])[n]
}

// 10
function fibValues(n){

	 return Array.from({length: n}, (_, i) => i+2 ).reduce((acc , curr ,index ) => {
        return  acc.concat([acc[curr-1] + acc[curr-2]])
    },[0,1])
}

// 11
function spellOutNumbers( str ){
    const aux = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen",
        "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const tens = [
        "", "", "twenty", "thirty", "forty",
        "fifty", "sixty", "seventy", "eighty", "ninety"];

    const reg = new RegExp(/\d+/g)

    const matches = str.match(reg)

    for( const match of matches){
        if(match >= 101) {
            continue;
        }
        
        if(match == 100) //type coercion required
            str = str.replace(match,"one hundred")

        else if(match>=20){

            const first = match.charAt(0);
            const second = match.charAt(1);

            const output = tens[first] + '-' + aux[second]

            str = str.replace(match,output)
        }
        else
            str = str.replace(match,aux[match])

    }
    return str;
}

// 12
function ninetyNineBottles(n=99){

    Array.from({length: n}, (x, i) => i)
        .forEach(e=> console.log(
            `${ spellOutNumbers( (n-e).toString() )} bottles of beer on the wall\ntake one down and pass it around\n`))
    console.log("no more bottles of beer on the wall, no more bottles of beer\n")

}

[x|y]+

(xy|yx)+

[x]{144,}[y]{33}

^[x]{10,20}[y]*
