package gw.db

enhancement ReaderEnhancement : java.io.BufferedReader {

	function readAll() : String {
	    var b = new java.lang.StringBuilder()
	    this.eachLine(\ line -> b.append(line).append("\n"))
	    if(b.length() > 0) {
		    b.setLength(b.length() - 1)  // strip last newline
	    }
	    return b.toString()
	}
	
	function eachLine(lineOp(line : String)) {
	    var line = this.readLine()
	    while(line != null) {
	        lineOp(line)
	        line = this.readLine()
	    }
	}

}
