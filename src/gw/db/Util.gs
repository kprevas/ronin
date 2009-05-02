package gw.db

uses java.sql.Types

internal class Util {

	static function getJavaType(sqlType : int) : Type {
		switch(sqlType) {
			case Types.BIT:
				return boolean
				
			case Types.TINYINT:
				return byte
				
			case Types.SMALLINT:
				return short
				
			case Types.INTEGER:
				return int
				
			case Types.BIGINT:
				return long
				
			case Types.FLOAT:
				return double
				
			case Types.REAL:
				return float
				
			case Types.DOUBLE:
				return double
				
			case Types.NUMERIC:
				return java.math.BigDecimal
				
			case Types.DECIMAL:
				return java.math.BigDecimal
				
			case Types.CHAR:
				return String
				
			case Types.VARCHAR:
				return String
				
			case Types.LONGVARCHAR:
				return String
				
			case Types.BOOLEAN:
				return boolean
				
			case Types.DATE:
				return java.sql.Date
				
			case Types.TIME:
				return java.sql.Time
				
			case Types.TIMESTAMP:
				return java.sql.Timestamp
				
			case Types.BINARY:
				return byte[]
				
			case Types.VARBINARY:
				return byte[]
				
			case Types.LONGVARBINARY:
				return byte[]
				
			case Types.NULL:
				return void
				
			case Types.OTHER:
				return Object
				
			case Types.JAVA_OBJECT:
				return Object
				
			case Types.DISTINCT:
				return Object
				
			case Types.STRUCT:
				return Object
				
			case Types.ARRAY:
				return Object[]
				
			case Types.BLOB:
				return Object
				
			case Types.CLOB:
				return Object
				
			case Types.REF:
				return Object
				
			case Types.DATALINK:
				return Object
				
		}
		return Object
	}

}