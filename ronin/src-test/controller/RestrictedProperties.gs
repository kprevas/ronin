package controller

uses ronin.*

class RestrictedProperties extends RoninController {

  function action(r : RestrictedPropertiesObj) {
    view.OneStringArg.render(Writer, "${r.Prop1} ${r.Prop2} ${r.Prop3} ${r.Prop4}")
  }

}