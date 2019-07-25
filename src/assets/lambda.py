import json

import ckanapi


def lambda_handler(event, context):
    params = json.loads(event['body'])

    # Moving from CKAN A to CKAN B
    a = ckanapi.RemoteCKAN(**params['from'])
    b = ckanapi.RemoteCKAN(**params['to'])

    if params['step'] == 'display':
        package = a.action.package_show(id=params['package'])

        try:
            b = b.action.package_show(id=params['package'])
            mode = 'update'
        except ckanapi.NotFound:
            mode = 'create'

        body = {
            'mode': mode,
            'package': package
        }
    elif params['step'] == 'replicate':
        pass

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
        },
        'body': json.dumps(body),
    }
