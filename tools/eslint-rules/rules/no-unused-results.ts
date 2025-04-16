import { AST_NODE_TYPES, ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { unionTypeParts } from "tsutils";
import { Reference, Variable } from "@typescript-eslint/scope-manager";
import { skipChainExpression } from "../utils/skip-chain-expression";
import ts from "typescript";

export enum MessageIds 
{
  MUST_USE = "mustUseResult",
  MUST_USE_RESULT_TYPE = "mustUseResultType",
}

export const noUnusedResults = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    docs: {
      description:
          "Not handling neverthrow result is a possible error because errors could remain unhandled.",
    },
    messages: {
      [MessageIds.MUST_USE]: "Result must be handled.",
      [MessageIds.MUST_USE_RESULT_TYPE]: "Return value of Result.{{methodName}}() call must be used",
    },
    schema: [],
    type: "problem",
    hasSuggestions: true,
  },
  defaultOptions: [],
  create(context) 
  {
    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      VariableDeclarator(node) 
      {
        if (!node.init)
          return;

        const tsNode = services.esTreeNodeToTSNodeMap.get(node.init);

        if (!isResultLike(tsNode))
          return;

        if (node.id.type !== AST_NODE_TYPES.Identifier)
          return;

        const currentScope = context.sourceCode.getScope(node);

        const variable = currentScope.set.get(node.id.name);
        if (!variable)
          return;

        if (isUnusedResultVariable(variable)) 
        {
          context.report({
            node,
            messageId: MessageIds.MUST_USE,
          });
          return;
        }
      },
      CallExpression(node) 
      {
        if (!isMemberCall(node, ["isOk", "isErr"]))
          return;

        const tsNode = services.esTreeNodeToTSNodeMap.get(node.callee.object);

        if (!isResultLike(tsNode))
          return;

        if (node.parent.type === AST_NODE_TYPES.ExpressionStatement) 
        {
          context.report({
            node: node,
            messageId: MessageIds.MUST_USE_RESULT_TYPE,
            data: {
              methodName: node.callee.property.name,
            },
          });
        }
      },
      ExpressionStatement(node) 
      {
        const expression = skipChainExpression(node.expression);

        if (expression.type === AST_NODE_TYPES.AssignmentExpression)
          return;

        if (expression.type === AST_NODE_TYPES.UnaryExpression && expression.operator === "void")
          return;

        const tsNode = services.esTreeNodeToTSNodeMap.get(expression);

        if (!isResultLike(tsNode))
          return;

        context.report({
          node: node,
          messageId: MessageIds.MUST_USE,
        });
      },
    };


    function isResultLike(node: ts.Node, type?: ts.Type) 
    {
      const resultProperties = [
        "mapErr",
        "map",
        "andThen",
        "orElse",
        "match",
        "unwrapOr",
      ];

      type ??= checker.getTypeAtLocation(node);

      const typeParts = unionTypeParts(checker.getApparentType(type));
      for (const ty of typeParts) 
      {
        if (resultProperties.every(p => ty.getProperty(p) !== undefined))
          return true;
      }

      return false;
    }

    function isUnusedResultVariable(variable: Variable): boolean 
    {
      const references = variable.references.filter(it => it.isRead() && it.isValueReference);

      if (references.length === 0)
        return true;

      for (const reference of references) 
      {
        if (isResultAssignedToOtherVariable(reference))
          return false;

        if (isMemberFunctionCalledOnResult(reference))
          return false;

        if (reference.identifier.parent.type === AST_NODE_TYPES.ReturnStatement)
          return false;
      }

      return true;
    }

    function isResultAssignedToOtherVariable(reference: Reference) 
    {
      const parent = reference.identifier.parent;

      if (parent.type !== AST_NODE_TYPES.VariableDeclarator)
        return false;

      return parent.init === reference.identifier;
    }

    function isMemberFunctionCalledOnResult(reference: Reference) 
    {
      const parent = reference.identifier.parent;

      if (parent.type !== AST_NODE_TYPES.MemberExpression)
        return false;

      const memberExpression = parent;

      if (memberExpression.computed)
        return false;

      if (memberExpression.parent.type !== AST_NODE_TYPES.CallExpression)
        return false;

      const callExpression = memberExpression.parent;

      if (memberExpression !== callExpression.callee)
        return false;

      if (memberExpression.property.type !== AST_NODE_TYPES.Identifier)
        return false;

      const memberName = memberExpression.property.name;

      const needsFollowUpCheck = memberName === "isOk" || memberName === "isErr";

      if (needsFollowUpCheck) 
      {
        // console.log(context.sourceCode.getText(callExpression));
      }

      return true;
    }

    function isMemberCall(node: TSESTree.Node, methodNames?: string[]): node is
        TSESTree.CallExpression & {
          callee: TSESTree.MemberExpression & { property: TSESTree.Identifier };
        } 
    {
      if (node.type !== AST_NODE_TYPES.CallExpression)
        return false;

      if (node.callee.type !== AST_NODE_TYPES.MemberExpression)
        return false;

      if (node.callee.property.type !== AST_NODE_TYPES.Identifier)
        return false;

      if (methodNames)
        return methodNames.includes(node.callee.property.name);

      return true;
    }
  },
});