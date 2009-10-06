package gw.db

uses gw.lang.reflect.IEnhanceableType

interface IDBType extends IEnhanceableType {

	property get Connection() : DBConnection

}