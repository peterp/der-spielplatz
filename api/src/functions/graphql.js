import path from 'path';
import requireDir from 'require-dir';
import { queryType, makeSchema } from 'nexus';
import { ApolloServer } from 'apollo-server-lambda';
// eslint-disable-next-line
import Photon from '@generated/photon';

const GRAPHQL_DIR = path.join(__dirname, '../graphql/');
const GRAPHQL_HOWTO = 'https://example.org/';
const OUTPUTS_DIR = path.join(__dirname, '../../generated/');

const helpString = `Start adding your Nexus schema definitions in ${GRAPHQL_DIR}, read more over here: ${GRAPHQL_HOWTO}`;
const BaseQueryType = queryType({
  definition(t) {
    t.string('help', {
      description: helpString,
      resolve() {
        return helpString;
      },
    });
  },
});
const moreGraphQLTypes = requireDir(GRAPHQL_DIR, {
  recurse: false,
  extensions: ['.js'],
});
const schema = makeSchema({
  types: [BaseQueryType, ...Object.values(moreGraphQLTypes)],
  outputs: {
    schema: path.join(GRAPHQL_DIR, 'generated-schema.graphql'),
    typegen: path.join(OUTPUTS_DIR, 'generated-types.d.ts'),
  },
});

const server = new ApolloServer({
  schema,
  context: {
    // TODO: Add current user.
    currentUser: null,
    photon: new Photon(),
  },
});
export const handler = server.createHandler();
