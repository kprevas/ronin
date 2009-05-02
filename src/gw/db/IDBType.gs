package gw.db

uses gw.lang.reflect.IType

interface IDBType extends IType {

	property get Connection() : DBConnection

}